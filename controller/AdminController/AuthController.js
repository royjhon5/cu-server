const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminUser = require('../../models/AdminModel/adminAuthModel');
const db = require('../../config/dbConnection');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
var https = require('follow-redirects').https;
const multer = require('multer');
const path = require('path');
const fs = require('fs');


module.exports.storage = multer.diskStorage({
  destination: (req, file, cb) => {
  const id_number = req.body.id_number;
  const folderPath = path.join('user_profile_picture', 'admin-profile', id_number);
  if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
  }
  cb(null, folderPath) 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});


module.exports.UploadProfilePicture = async function(req, res) {
  try {
    const id_number = req.body.id_number;
    const oldImage = req.body.old_image; 
    const newImage = req.file.filename;
    await db.query('UPDATE admin_user SET profile_picture = ? WHERE id_number = ?;', [newImage, id_number], async (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
      } else {
        if (oldImage) {
          const imagePath = path.join('user_profile_picture', 'admin-profile', id_number, oldImage);
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            } else {
              console.log("Old image deleted successfully");
            }
          });
        }
        res.status(200).send('Profile picture updated successfully!');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

module.exports.UploadCoverPicture = async function(req, res) {
  try {
    const id_number = req.body.id_number;
    const oldImage = req.body.old_image; 
    const newImage = req.file.filename;
    await db.query('UPDATE admin_user SET cover_photo = ? WHERE id_number = ?;', [newImage, id_number], async (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
      } else {
        if (oldImage) {
          const imagePath = path.join('user_profile_picture', 'admin-profile', id_number, oldImage);
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
            } else {
              console.log("Old image Cover Photo deleted successfully");
            }
          });
        }
        res.status(200).send('Cover Photo updated successfully!');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
}

module.exports.getUserProfile = async function(req, res) {
  const { id_number } = req.query;
  try {
    db.query('SELECT * FROM admin_user WHERE id_number = ?',[id_number], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}


module.exports.getIdnumber = async function(req, res) {
  const { id_number } = req.query; 
  try {
    await db.query('SELECT * FROM admin_user WHERE id_number = ?', [id_number], async (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
      } else {
        if (results.length === 0) {
          res.status(400).send({ error: 'ID number does not exist' });
        } else {
          const user = results[0];
          if (user.is_disable === 1) {
            res.status(400).send({ error: 'Account locked. Please contact support.' });
          } else {
            try {
              const OTP = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
              const transporter = nodemailer.createTransport({
                service: 'gmail', 
                host: 'smpt.gmail.com',
                port: 587,
                auth: {
                  user: process.env.EMAIL_NODE,
                  pass: process.env.EMAIL_PASS_NODE,
                }
              });
              const mailOptions = {
                from: 'cugiftshop7@gmail.com',
                to: user.email,
                subject: 'Email Confirmation',
                html: `<!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            .container {
                                background-color: #E5E5E5;
                                padding: 20px;
                                width: 35%;
                                margin: 0 auto;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <img src="https://www.cu.edu.ph/wp-content/uploads/2021/06/CU-Logo-web.png" style="width: 100%; height: 100%; background-color: #9F1E22; border-radius: 10px;">
                            <h1>Account Password Reset:</h1>
                            <p style="font-weight: bold; font-size: 24px;">Hi ${user.first_name}</p>
                            <p style="font-weight: bold; font-size: 16px;">Here is your One-time passcode:</p>
                            <div style="padding: 10px; background-color:#F9F9F9;">
                              <p style="font-size: 35px; letter-spacing: 1em;">${OTP}</p>
                            </div>
                            <p>If this request did not come from you, change your account password immediately to prevent further unauthorized access.</p>
                        </div>
                    </body>
                    </html>
                `
              };
              await transporter.sendMail(mailOptions);
              await db.query('UPDATE admin_user SET OTP = ? WHERE id_number = ?;', [OTP, id_number]);
              res.status(200).send(user);
            } catch (emailError) {
              console.error(emailError);
              res.status(500).send('Failed to send OTP email. Please try again later.');
            }
          }
        }
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}

module.exports.UpdatePassword = async function(req, res) {
  const { OTP, newPassword } = req.query;
  try {
      await db.query('SELECT * FROM admin_user WHERE OTP = ?', [OTP], async (err, results) => {
          if (err) {
              console.error(err);
              res.status(500).send('Server Error');
          }
          if (results.length === 0) {
              res.status(400).send({ error: 'Invalid OTP' });
          } else {
              const user = results[0];
              try {
                  const salt = await bcrypt.genSalt(10);
                  const hashedPassword = await bcrypt.hash(newPassword, salt);
                  await db.query('UPDATE admin_user SET password = ?, OTP = NULL WHERE id = ?', [hashedPassword, user.id], (err, result) => {
                      if (err) {
                          console.error(err);
                          res.status(500).send('Server Error');
                      } else {
                          res.status(200).send('Password updated successfully');
                      }
                  });
              } catch (hashError) {
                  console.error(hashError);
                  res.status(500).send('Server Error');
              }
          }
      });
  } catch(error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
}



module.exports.adminUserReg = async function(req, res) {
  const { id_number, password, first_name } = req.body;
  try {
    adminUser.findByIdNumber(id_number, async(err, existingUser) => { 
      if(err){
        console.error(err);
        return res.status(500).json({ error: 'Server Error'});
      }
      if (existingUser) {
        return res.status(400).json({ error: 'User already exist'});
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        id_number, 
        first_name,
        password: hashedPassword
      }
      adminUser.register(newUser, (err, userId) => {
        if(err){
          console.error(err);
          return res.status(500).json({ message: 'Server Error' });
        }
        const payLoad = {
          user: { 
            id: userId
          }
        };
        jwt.sign(payLoad, process.env.SECRET_KEY, { expiresIn: '1h'}, (err, token) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server Error'});
          }
          res.cookie('token', token, { httpOnly: true }).json({ token });;
        })
      })
    })
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

module.exports.userLogin = async function(req, res) {
  const { id_number, password } = req.body;
  try {
      const user = await adminUser.findIdNumberLogin(id_number);
      if (!user) return res.status(400).json({ error: 'Invalid Id Number' });
      if (user.access_token) return res.status(400).json({ error: 'User is already logged in on another device.' });
      if (user.is_disable === 1) return res.status(400).json({ error: 'Account locked. Please contact support.' });
      const match = await bcrypt.compare(password , user.password);
        if (!match) {
          if (user.failed_login_attempts >= 5) {
            await adminUser.isDisable(user.id)
            return res.status(400).json({ error: 'Account locked. Please contact support.' });
          } else {
            await adminUser.incrementFailedAttempts(user.id);
          }
          return res.status(400).json({ error: 'Invalid password!' });
        }
      const userID = user.id;
      const fName = user.first_name;
      const idNumber = user.id_number;
      await adminUser.resetFailedAttempts(user.id);
      const accessToken = jwt.sign({userID, fName, idNumber}, process.env.SECRET_KEY, {
        expiresIn: '1d'
      }); 
      await db.query('UPDATE admin_user SET access_token = ? WHERE id = ?;', [
        accessToken, user.id
      ]);
      await db.query('UPDATE admin_user SET last_login = now() WHERE id =?;', [
          user.id,
      ]);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
      });
      res.json({ accessToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}

module.exports.userLogout = async function(req, res) {
  const accessToken = req.cookies.accessToken;
  if(!accessToken) return res.sendStatus(204);
  const user = await adminUser.findAll(accessToken);
  if(!user) return res.sendStatus(204);
    await db.query('UPDATE admin_user SET access_token = ?, last_login = now() WHERE id = ?', [
      '', user.id
  ]);
  res.clearCookie('accessToken');
  return res.sendStatus(200);
}

module.exports.newClientRegistrationNotification = async function(req, res) {
  const query = 'SELECT COUNT(*) AS count from notifications WHERE is_open = 0'
  await db.query(query, (err, results) => {
    if(err) {
      console.error('Error executing the query', err.stack);
      return
    }
    res.status(200).send(results)
  })
}

module.exports.isOpenNotification = async function(req, res) {
  const query = 'UPDATE notifications SET is_open = 1';
  await db.query(query, (err, results) => {
    if(err){
      console.error('Error executing the query', err.stack);
      return;
    }
    res.status(200).send(results)
  })
}

module.exports.unreadNotification = async function (req, res) {
  const query = `SELECT notifications.*, client_user.* 
                 FROM notifications
                 INNER JOIN client_user on notifications.user_id_number = client_user.id_number
                 ORDER BY notifications.id DESC`;
  await db.query(query, (err, results) => {
    if(err) {
      console.error('Error executing the query', err.stack);
      return;
    }
    res.status(200).send(results)
  })
}

module.exports.readNotification = async function(req, res) {
  const query = 'UPDATE notifications SET notif_status = 1';
  await db.query(query, (err, results) => {
    if(err){
      console.error('Error executing the query', err.stack);
      return;
    }
    res.status(200).send(results)
  })
}


module.exports.acceptNewClient = async function(req, res) {
  const { id_number } = req.query;
  try {
    db.query('UPDATE client_user SET status = ? WHERE id_number = ?', ['activated', id_number], (err, results) => {
      if (err) throw err;
      res.json(results);
    });
    db.query('UPDATE notifications SET notif_status = ? WHERE user_id_number = ?', ['1', id_number]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

