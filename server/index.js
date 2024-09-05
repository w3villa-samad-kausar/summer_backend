const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfig');


// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig)
});
require('dotenv').config();

const authRouter = require('./routes/authRoute');
const profileRouter = require('./routes/profileRoute');
const adminRouter=require('./routes/adminRoute')
const express = require('express');
const bodyParser = require('body-parser');
const { createVerificationTable } = require('./models/verificationModel'); // for creating verification table
const { createTable } = require('./models/usersModel'); // for creating user table
createTable()
createVerificationTable()

const port = process.env.PORT || 3000||3002;

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
app.use('/api',authRouter)
app.use('/api',profileRouter)
app.use('/api',adminRouter)

app.get('/',(req,res)=>{
  res.send('hello world')
})

//server start
app.listen(port,()=>{
  console.log(`server is running on http://localhost:${port}`);
})
