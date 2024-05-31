const db = require('../../config/dbConnection');

const adminModel = {
    findAll: function(refresh_token){
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM admin_user WHERE access_token = ?';
            db.query(query, [refresh_token], function(err, results){ 
                if(err){
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve(null);
                    } else {
                        const user = results[0];
                        resolve(user);
                    }
                }
            });
        });
    },

    findByIdNumber: function(id_number, callback){
        const query = 'SELECT * FROM admin_user WHERE id_number = ?';
        db.query(query, [id_number], function(err, results){ 
            if(err){
                return callback(err, null)
            }
            if(results.length === 0) {
                return callback(null, null);
            }
            const user = results[0];
            callback(null, user);
        })
    },

    findIdNumberLogin: function(id_number) {
        const query = 'SELECT * FROM admin_user WHERE id_number = ?';
        return new Promise((resolve, reject) => {
          db.query(query, [id_number], function(err, results) {
            if (err) {
              return reject(err);
            }
            if (results.length === 0) {
              return resolve(null);
            }
            const user = results[0];
            resolve(user);
          });
        });
    },

    findById: function(id) {
      const query = "SELECT * FROM admin_user WHERE id = ?"
      return new Promise((resolve, reject) => {
        db.query(query, [id], function(err, results) {
          if (err) {
            return reject(err);
          }
          if (results.length === 0) {
            return resolve(null);
          }
          const user = results[0];
          resolve(user);
        });
      });
    },
    

    findEmail: function(email) {
      const query = "SELECT * FROM admin_user WHERE email = ?"
      return new Promise((resolve, reject) => {
        db.query(query, [email], function(err, results) {
          if (err) {
            return reject(err);
          }
          if (results.length === 0) {
            return resolve(null);
          }
          const user = results[0];
          resolve(user);
        });
      });
    },

    InsertOTP: function(opt, user_id) {
      const query = "UPDATE admin_user SET OTP = ? WHERE id = ?"
      return new Promise((resolve, reject) => {
        db.query(query, [opt, user_id], function(err, results) {
          if (err) {
            return reject(err);
          }
          if (results.length === 0) {
            return resolve(null);
          }
          const user = results[0];
          resolve(user);
        });
      });
    },

    incrementFailedAttempts: function(user_id) {
        const query = 'UPDATE admin_user SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?'
        return new Promise((resolve, reject) => {
            db.query(query, [user_id], function(err, results) {
              if (err) {
                return reject(err);
              }
              if (results.length === 0) {
                return resolve(null);
              }
              const user = results[0];
              resolve(user);
            });
          });
    },

    isDisable: function(user_id) {
        const query = 'UPDATE admin_user SET is_disable = 1 WHERE id = ?'
        return new Promise((resolve, reject) => {
            db.query(query, [user_id], function(err, results) {
              if (err) {
                return reject(err);
              }
              if (results.length === 0) {
                return resolve(null);
              }
              const user = results[0];
              resolve(user);
            });
          });
    },

    resetFailedAttempts: function(user_id) {
      const query = 'UPDATE admin_user SET failed_login_attempts = 0 WHERE id = ?'
      return new Promise((resolve, reject) => {
          db.query(query, [user_id], function(err, results) {
            if (err) {
              return reject(err);
            }
            if (results.length === 0) {
              return resolve(null);
            }
            const user = results[0];
            resolve(user);
          });
        });
    },

    register: function(user, callback) {
        const query = 'INSERT INTO admin_user SET ?';
        db.query(query, user, function(err, results) {
            if(err){
                return callback(err, null)
            }
            callback(null, results.insertId)
        });
    }
}

module.exports = adminModel;