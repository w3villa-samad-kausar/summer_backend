require('dotenv').config();
const mysql = require('mysql2');

// Using the connection string from the .env file
const conn = mysql.createConnection(process.env.DB_CONNECTION_STRING);

conn.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

module.exports = conn;
