const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.PORT,
    user: process.env.DB_USER,
    passowrd: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth: false
});

connection.connect((err) => {
    if(err) {
        console.error('Error connecting to database', err)
        return;
    }
    console.log('Connected to the database');
});


module.exports = connection;