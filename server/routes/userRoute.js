const express=require("express");
const router=express.Router();
const { signupValidation } = require("../helpers/validation");
const userController = require("../controllers/userController");
const emailVerification = require("../controllers/emailVerification");
// const { default: OtpVerification } = require("../../screens/authScreens/OtpVerification");

// const otpVerification=require("../controller/otpVerification");

const otpVerification=require("../controllers/otpVerification")

router.post('/register',signupValidation,userController.register);
router.get('/verify-email',emailVerification.verifyEmail);
router.post('/verify-otp',otpVerification.verifyOtp);

module.exports=router;