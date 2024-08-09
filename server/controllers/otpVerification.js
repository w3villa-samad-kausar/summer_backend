
const db = require('../config/db_config');
const userQueries = require('../queries/userQueries')
const messages = require('../messages/messages.json')

const verifyOtp = (req, res) => {
    const mobileNumber = req.body.mobileNumber;
    const userOtp = req.body.otp;

    userQueries.checkMobileVerified(mobileNumber, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).json({ msg: messages.databaseQueryError });
        }

        if (!result || !result.length) {
            return res.status(400).json({ msg: messages.mobileAlreadyVerified });
        }
    })

    userQueries.checkUserByMobileNumber(mobileNumber, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).json({ msg: messages.databaseQueryError });
        }
        
        if (!result || !result.length) {
            return res.status(400).json({ msg: messages.userNotFound });
        }

        const verificationRecord = result[0];

        const currentTime = new Date();
        const userData = verificationRecord.user_data;

        // Check if the current time is before the expiration time
        if (currentTime > new Date(verificationRecord.mobile_otp_expire_at)) {
            return res.status(400).json({ msg: messages.otpTimeExpired });
        }


        // Check if the OTP matches
        if (userOtp !== verificationRecord.mobile_otp) {
            return res.status(400).json({ msg: messages.invalidOtp });
        }
        db.beginTransaction((err) => {
            if (err) {
                console.error(messages.databaseTransactionError, err);
                return res.status(500).json({ msg: messages.databaseTransactionError });
            }

            userQueries.updateMobileVerifiedStatus(mobileNumber, (err, updateResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(messages.databaseUpdateError, err);
                        return res.status(500).json({ msg: messages.databaseUpdateError });
                    });
                }

                userQueries.insertUser(userData,
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(messages.databaseInsertError, err);
                                return res.status(500).json({ msg: messages.databaseInsertError });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(messages.databaseCommitError, err);
                                    return res.status(500).json({ msg: messages.databaseCommitError });
                                });
                            }

                            return res.status(200).json({ msg: messages.otpVerifiedSuccess });
                        });
                    }
                );
            });
        });

    })
}



module.exports = { verifyOtp }
