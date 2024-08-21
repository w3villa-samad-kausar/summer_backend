const sendOtp = require("../helpers/sendOtp");
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const { generateOtp } = require('../helpers/otpGenerator')

const sendOtpForSocialSignin = async (req, res) => {
    const mobileNumber = req.body.mobileNumber;
    const email = req.body.email;

    userQueries.checkEmailExistsInUser_Verification_table(email, (err, result) => {
        if (err) {
            return res.status(400).send({ msg: err.sqlMessage });
        }
        if (!result.length) {
            return res.status(400).send({ msg: messages.userNotFound })
        }
        if (result) {
            // Generate OTP
            const mobileOtp = generateOtp();
            // Calculate OTP expiry time
            const mobileOtpExpireAt = new Date(Date.now() + 300 * 1000); // 5 minutes from now
            userQueries.insertOtp(email, mobileNumber, mobileOtp, mobileOtpExpireAt, async (err, result) => {
                //database query error
                if (err) {
                    return res.status(400).send({ msg: err.sqlMessage });
                }
                //OTP inserted successfully
                if (result) {
                    // Send OTP via SMS
                    try {
                        await sendOtp(mobileNumber, mobileOtp);
                        return res.status(201).send({ msg: messages.otpSentSuccess });
                    } catch (error) {
                        console.error('Error sending OTP:', error);
                        return res.status(500).send({ msg: messages.failedOtpSend, error });
                    }
                }
            })
        }
    })
}


module.exports = { sendOtpForSocialSignin }