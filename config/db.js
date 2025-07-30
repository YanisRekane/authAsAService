require('dotenv').config({ quiet: true });
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME
})

//connect
connection.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err.stack);
    return;
  }
  //console.log('Connected to MySQL as ID', connection.threadId);
});

module.exports = connection.promise();