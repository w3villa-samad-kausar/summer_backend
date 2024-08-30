const express=require("express");
const router=express.Router();
const { signupValidation,loginValidation, socialLoginValidation} = require("../helpers/validation");
const userRegister = require("../controllers/authControllers/userRegister");
const emailVerification = require("../controllers/authControllers/emailVerification");
const otpVerification=require("../controllers/authControllers/otpVerification");
const userLogin = require("../controllers/authControllers/userLogin");
const resendOtp = require("../controllers/authControllers/resendOTP");
const resendEmailVerification = require("../controllers/authControllers/resendMail");
const socialLogin  = require("../controllers/authControllers/socialLogin");
const sendOtp = require('../controllers/authControllers/sendOtpForSocialSignin');

router.post('/register',signupValidation,userRegister.register);
router.get('/verify-email',emailVerification.verifyEmail);
router.post('/verify-otp',otpVerification.verifyOtp);
router.post('/resend-otp',resendOtp)
router.post('/resend-email-verification', resendEmailVerification);
router.post('/send-Otp',sendOtp.sendOtpForSocialSignin)


router.post('/login',loginValidation,userLogin.login);
router.post('/social-login',socialLoginValidation,socialLogin.oAuthLogin);

module.exports=router;