require('dotenv').config();


const conn = require('./config/db_config');
const userRouter = require('./routes/userRoute');


const express = require('express');
const bodyParser = require('body-parser');
// const { createTable } = require('./models/verificationModel'); // for creating verification table
// const { createTable } = require('./models/usersModel'); // for creating user table


const port = process.env.PORT || 3000;

const app=express();

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//error handling
app.use((err,req,res,next)=>{
  err.statusCode=err.statusCode||500
  err.message=err.message||"internal server error"
  res.status(err.statusCode).json({
    message:err.message
  })
})

//routes
app.use('/api',userRouter)

app.get('/',(req,res)=>{
  res.send('hello world')
})

//server start
app.listen(port,()=>{
  console.log(`server is running on http://localhost:${port}`);
})
