const express=require("express");
const router=express.Router();
const { signupValidation,loginValidation } = require("../helpers/validation");
const userController = require("../controllers/userController");
const emailVerification = require("../controllers/emailVerification");

const otpVerification=require("../controllers/otpVerification")

router.post('/register',signupValidation,userController.register);
router.get('/verify-email',emailVerification.verifyEmail);
router.post('/verify-otp',otpVerification.verifyOtp);

module.exports=router;