const otplib = require('otplib');
const sendOtp = require("../helpers/sendOtp");
const db = require("../config/db_config");
const userQueries=require('../queries/userQueries');
const messages = require('../messages/messages.json');
const resendOtp = async (req, res) => {
  // First, check if the mobile is already verified
  
   userQueries.checkMobileVerified(req.body.mobileNumber, (error, results) => {
    if (error) {
      console.error(messages.failedMobileVerification, error);
      return res.status(500).send({ msg: messages.failedMobileVerification, error });
    }
    
    if (results.length === 0) {
      return res.status(404).send({ msg: messages.userNotFound });
    }

    const { is_mobile_verified } = results[0];
    if (is_mobile_verified) {
      return res.status(400).send({ msg: messages.mobileVerified });
    }

    // Generate OTP
    otplib.authenticator.options = { digits: 4, step: 120 }; // step is 120 seconds (2 minutes)
    const secret = otplib.authenticator.generateSecret(); // Generate a unique secret for the user
    const mobileOtp = otplib.authenticator.generate(secret);

    // Calculate OTP expiry time
    const mobileOtpExpireAt = new Date(Date.now() + 120 * 1000); // 2 minutes from now

    // Update database with new OTP and expiry time
    

    userQueries.updateOtp(mobileOtp, mobileOtpExpireAt, req.body.mobileNumber, async (error, results) => {
      if (error) {
        console.error(messages.failedOtpUpdate, error);
        return res.status(500).send({ msg: messages.failedOtpUpdate, error });
      }

      // Send OTP via SMS
      try {
        await sendOtp(req.body.mobileNumber, mobileOtp);
        return res.status(201).send({ msg: messages.otpResent, otp: mobileOtp });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).send({ msg: messages.failedOtpSend, error });
      }
    });
  });
};

module.exports = resendOtp;
