const otplib = require('otplib');
const sendOtp = require("../helpers/sendOtp");
const db = require("../config/db_config");

const resendOtp = async (req, res) => {
  // First, check if the mobile is already verified
  const selectQuery = `
    SELECT is_mobile_verified FROM user_verification_table
    WHERE mobile_number = ?
  `;

  db.query(selectQuery, [req.body.mobileNumber], (error, results) => {
    if (error) {
      console.error('Error checking mobile verification:', error);
      return res.status(500).send({ msg: 'Failed to check mobile verification', error });
    }
    
    if (results.length === 0) {
      return res.status(404).send({ msg: 'User not found' });
    }

    const { is_mobile_verified } = results[0];
    if (is_mobile_verified) {
      return res.status(400).send({ msg: 'Mobile number is already verified' });
    }

    // Generate OTP
    otplib.authenticator.options = { digits: 4, step: 120 }; // step is 120 seconds (2 minutes)
    const secret = otplib.authenticator.generateSecret(); // Generate a unique secret for the user
    const mobileOtp = otplib.authenticator.generate(secret);

    // Calculate OTP expiry time
    const mobileOtpExpireAt = new Date(Date.now() + 120 * 1000); // 2 minutes from now

    // Update database with new OTP and expiry time
    const updateQuery = `
      UPDATE user_verification_table
      SET mobile_otp = ?, mobile_otp_expire_at = ?, otp_retry_count = otp_retry_count + 1
      WHERE mobile_number = ?
    `;

    db.query(updateQuery, [mobileOtp, mobileOtpExpireAt, req.body.mobileNumber], async (error, results) => {
      if (error) {
        console.error('Error updating OTP:', error);
        return res.status(500).send({ msg: 'Failed to update OTP', error });
      }

      // Send OTP via SMS
      try {
        await sendOtp(req.body.mobileNumber, mobileOtp);
        return res.status(201).send({ msg: 'OTP resent. Please check your messages', otp: mobileOtp });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).send({ msg: 'Failed to send OTP', error });
      }
    });
  });
};

module.exports = resendOtp;
