const express=require("express");
const router=express.Router();
const { signupValidation,loginValidation } = require("../helpers/validation");
const userRegister = require("../controllers/userRegister");
const emailVerification = require("../controllers/emailVerification");
const otpVerification=require("../controllers/otpVerification");
const userLogin = require("../controllers/userLogin");
const resendOtp = require("../controllers/resendOTP");
const resendEmailVerification = require("../controllers/resendMail");

router.post('/register',signupValidation,userRegister.register);
router.post('/verify-email',emailVerification.verifyEmail);
router.post('/verify-otp',otpVerification.verifyOtp);
router.post('/resend-otp',resendOtp)
router.post('/resend-email-verification', resendEmailVerification);


router.post('/login',loginValidation,userLogin.login)

module.exports=router;