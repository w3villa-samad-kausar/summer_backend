const sendOtp = require("../helpers/sendOtp");
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const { generateOtp } = require('../helpers/otpGenerator')
const resendOtp = async (req, res) => {
  // First, check if the mobile is already verified

  userQueries.checkMobileVerified(req.body.mobileNumber, (error, results) => {
    if (error) {
      console.error(messages.failedMobileVerification, error);
      return res.status(500).send({ msg:error.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(404).send({ msg: messages.userNotFound });
    }

    const { is_mobile_verified } = results[0];
    if (is_mobile_verified) {
      return res.status(400).send({ msg: messages.mobileAlreadyVerified });
    }

    // Generate OTP
    const mobileOtp = generateOtp();
    // Calculate OTP expiry time
    const mobileOtpExpireAt = new Date(Date.now() + 300 * 1000); // 5 minutes from now

    // Update database with new OTP and expiry time


    userQueries.updateOtp(mobileOtp, mobileOtpExpireAt, req.body.mobileNumber, async (error, results) => {
      if (error) {
        console.error(messages.failedOtpUpdate, error);
        return res.status(500).send({ msg:error.sqlMessage });
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
