const adminUser = require('../../models/AdminModel/adminAuthModel');
const jwt = require('jsonwebtoken');

module.exports.refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(400).json({ error: 'Fucking pc of sht more' });
        const users = await adminUser.findAll({refresh_token: refreshToken});
        if(!users) return res.sendStatus(403);  
        jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, decoded) => {
            if(err) return res.status(400).json({ error: 'Fucking pc of sht' });
            const userId = users.id;
            const fName = users.first_name;
            const idNumber = users.id_number;
            const accessToken = jwt.sign({ userId, fName, idNumber }, process.env.SECRET_KEY, {
                expiresIn: '15s'
            });
            res.json({ accessToken });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');     
    }
}
