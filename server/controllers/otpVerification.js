const db = require('../config/db_config');
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const jwtTokenGenerator = require('../helpers/jwtTokenGenerator');

const verifyOtp = (req, res) => {
    const mobileNumber = req.body.mobileNumber;
    const userOtp = req.body.otp;

    userQueries.checkMobileVerified(mobileNumber, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).json({ msg: err.sqlMessage });
        }

        if (!result || !result.length) {
            return res.status(400).json({ msg: messages.mobileAlreadyVerified });
        }
    });

    userQueries.checkUserByMobileNumber(mobileNumber, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).json({ msg: err.sqlMessage });
        }
        
        if (!result || !result.length) {
            return res.status(400).json({ msg: messages.userNotFound });
        }

        const verificationRecord = result[0];
        const currentTime = new Date();
        const userData = verificationRecord.user_data;

        if (currentTime > new Date(verificationRecord.mobile_otp_expire_at)) {
            return res.status(400).json({ msg: messages.otpTimeExpired });
        }

        if (userOtp !== verificationRecord.mobile_otp) {
            return res.status(400).json({ msg: messages.invalidOtp });
        }

        const handleUserInsert = () => {
            userQueries.checkUserByEmail(userData.email, (err, existingUser) => {
                if (err) {
                    console.error(messages.databaseQueryError, err);
                    return res.status(500).json({ msg: err.sqlMessage });
                }

                if (existingUser.length > 0) {
                    return res.status(400).json({ msg: messages.userAlreadyExists });
                }

                db.beginTransaction((err) => {
                    if (err) {
                        console.error(messages.databaseTransactionError, err);
                        return res.status(500).json({ msg: err.sqlMessage });
                    }

                    userQueries.updateMobileVerifiedStatus(mobileNumber, (err, updateResult) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(messages.databaseUpdateError, err);
                                return res.status(500).json({ msg: messages.databaseUpdateError });
                            });
                        }

                        userQueries.insertUser(userData, (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(messages.databaseInsertError, err);
                                    return res.status(500).json({ msg: err.sqlMessage });
                                });
                            }

                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error(messages.databaseCommitError, err);
                                        return res.status(500).json({ msg: messages.databaseCommitError });
                                    });
                                }

                                const jwtToken = jwtTokenGenerator(userData.email);
                                return res.status(200).json({ 
                                    msg: messages.otpVerifiedSuccess,
                                    token: jwtToken 
                                });
                            });
                        });
                    });
                });
            });
        };

        if (verificationRecord.is_social_signin) {
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

                    userQueries.insertSocialUserInUser_Table(userData, mobileNumber, (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(messages.databaseInsertError, err);
                                return res.status(500).json({ msg: err.sqlMessage });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error(messages.databaseCommitError, err);
                                    return res.status(500).json({ msg: messages.databaseCommitError });
                                });
                            }

                            const jwtToken = jwtTokenGenerator(userData.email);
                            return res.status(200).json({ 
                                msg: messages.otpVerifiedSuccess,
                                token: jwtToken 
                            });
                        });
                    });
                });
            });
        } else {
            handleUserInsert();
        }
    });
};

module.exports = { verifyOtp };
