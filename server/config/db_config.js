require('dotenv').config();

const mysql = require('mysql2');

const conn= mysql.createConnection({
  host:process.env.DB_HOST,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  connectTimeout: 10000 
})

conn.connect((err)=>{
  if(err) throw err
  console.log('connected to database')
})

module.exports=conn

