const { validationResult } = require('express-validator');
const sendOtp = require('../helpers/sendOtp');
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const db = require('../config/db_config');
const { hashPassword } = require('../helpers/passwordHasher');
const { generateOtp } = require('../helpers/otpGenerator');

const register = async (req, res) => {
    try {
        // Check for validations 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = db.escape(req.body.email);

        // Check if the user exists in user_table
        userQueries.checkUserByEmailInUser_Table(req.body.email, async (err, result) => {
            if (err) {
                console.error(messages.databaseQueryError, err.sqlMessage);
                return res.status(500).send({ msg: err.sqlMessage });
            }

            if (result && result.length) {
                console.error(messages.userAlreadyExists);
                return res.status(400).send({ msg: messages.userAlreadyExists });
            }

            // User is not in user_table
            if (!result || result.length === 0) {
                userQueries.checkEmailExistsInUser_Verification_table(email, async (err, result) => {
                    if (err) {
                        console.error(messages.databaseQueryError, err);
                        return res.status(500).send({ msg: err.sqlMessage });
                    }

                    // If email is already present in user_verification_table
                    if (result && result.length) {
                        // user has already registered but not verifiedd anything , so updating everything
                        // Generate OTP
                        const mobileOtp = generateOtp();

                        // Hash the password
                        const hashedPassword = await hashPassword(req.body.password);

                        // Create user data with the hashed password
                        const userData = JSON.stringify({
                            name: req.body.name,
                            email: req.body.email,
                            password: hashedPassword,
                            mobileNumber: req.body.mobileNumber
                        });

                        //updating the database
                        userQueries.updateUserVerification(userData,mobileOtp,req.body.mobileNumber,req.body.email, async(err,result)=>{
                            if (err) {
                                console.error(messages.databaseInsertError, err);
                                return res.status(500).send({ msg: err.sqlMessage });
                            }

                            try {
                                // Send the OTP after the database insertion is successful
                                await sendOtp(req.body.mobileNumber, mobileOtp);
                                return res.status(201).send({ msg: messages.userRegistered });
                            } catch (error) {
                                console.error(messages.otpSendError, error);
                                return res.status(500).send({ msg: messages.otpSendError, error });
                            }
                        
                        })

                    }
                     else {
                        // Generate OTP
                        const mobileOtp = generateOtp();

                        // Hash the password
                        const hashedPassword = await hashPassword(req.body.password);

                        // Create user data with the hashed password
                        const userData = JSON.stringify({
                            name: req.body.name,
                            email: req.body.email,
                            password: hashedPassword,
                            mobileNumber: req.body.mobileNumber
                        });

                        // Insert user data into the database
                        userQueries.insertUserVerification(userData, mobileOtp, req.body.email, req.body.mobileNumber, async (err, result) => {
                            if (err) {
                                console.error(messages.databaseInsertError, err);
                                return res.status(500).send({msg: err.sqlMessage });
                            }

                            try {
                                // Send the OTP after the database insertion is successful
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
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).send({ msg: 'Error during registration', error: err });
    }
}

module.exports = { register };
