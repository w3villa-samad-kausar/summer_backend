const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const otplib = require('otplib');
const sendMail = require('../helpers/sendMail');
const sendOtp = require('../helpers/sendOtp');
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const db = require('../config/db_config')
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const email = db.escape(req.body.email);

    userQueries.checkUserByEmailInUser_Table(email, (err, result) => {
        //database query error
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).send({ msg: messages.databaseQueryError });
        }

        //if user exists
        if (result && result.length) {
            return res.status(400).send({ msg: messages.userAlreadyExists });
        }

        if (!result || result.length === 0) {

            userQueries.checkEmailExistsInUser_Verification_table(email, (err, result) => {

                //database query error
                if (err) {
                    console.error(messages.databaseQueryError, err);
                    return res.status(500).send({ msg: messages.databaseQueryError });
                }

                // if email is already present in user_verification_table
                if (result && result.length) {
                    return res.status(400).send({msg:messages.emailExists})

                } 
                else {
                    bcrypt.hash(req.body.password, 10, async (err, hash) => {
                        if (err) {
                            console.error(messages.hashPasswordError, err);
                            return res.status(500).send({ msg: messages.hashPasswordError });
                        } else {
                            const uniqueReferenceId = crypto.randomBytes(16).toString('hex');
                            otplib.authenticator.options = { digits: 4, step: 120 };
                            const secret = otplib.authenticator.generateSecret();
                            const mobileOtp = otplib.authenticator.generate(secret);


                            const verificationToken = crypto.randomBytes(32).toString('hex');
                            const verificationHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
                            const userData = JSON.stringify({
                                name: req.body.name,
                                email: req.body.email,
                                password: hash,
                                mobileNumber: req.body.mobileNumber
                            });

                            userQueries.insertUserVerification(uniqueReferenceId, verificationHash, userData, mobileOtp, req.body.email, req.body.mobileNumber, async (err, result) => {
                                if (err) {
                                    console.error(messages.databaseInsertError, err);
                                    return res.status(500).send({ msg: messages.databaseInsertError, error: err });
                                }


                                const content = `<p>${messages.emailBody}<br/><a href="${messages.emailVerificationLink}${verificationHash}">${messages.emailVerificationLinkText}</a></p>`;
                                await sendMail(req.body.email, messages.emailSubject, content);

                                try {
                                    await sendOtp(req.body.mobileNumber, mobileOtp);
                                    return res.status(201).send({ msg: messages.userRegistered });
                                } catch (error) {
                                    console.error(messages.otpSendError, error);
                                    return res.status(500).send({ msg: messages.otpSendError, error });
                                }
                            });
                        }
                    });
                }
            });

        }

    })

};

module.exports = { register };
