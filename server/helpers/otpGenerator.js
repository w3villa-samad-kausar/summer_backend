const otplib = require('otplib');

/**
 * Generates a 4-digit OTP.
 * @returns {string} - The generated OTP.
 */
function generateOtp() {
    otplib.authenticator.options = { digits: 4, step: 120 };
    const secret = otplib.authenticator.generateSecret();
    const mobileOtp = otplib.authenticator.generate(secret);
    return mobileOtp;
}

module.exports = { generateOtp };
