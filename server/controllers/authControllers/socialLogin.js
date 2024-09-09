const userQueries = require('../../queries/userQueries');
const messages = require('../../messages/messages.json');
const jwtTokenGenerator = require("../../helpers/jwtTokenGenerator");

const oAuthLogin = (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    console.log(email)
    userQueries.checkUserByEmailInUser_Table(email, async (err, result) => {

        // Database query error
        if (err) {
            return res.status(400).send({ msg: err.sqlMessage });
        }

        // If user doesn't exist
        if (result.length === 0) {
            const userData = JSON.stringify({
                name: name,
                email: email,
            });
            userQueries.insertSocialUser(email, userData, (err, result) => {
                // Database query error
                if (err) {
                    console.log(err)
                    return res.status(400).send({ msg: err.sqlMessage });
                }
                // If user created successfully then send them to asking number page
                if (result) {
                    console.log(result)
                    return res.status(200).send({ msg: messages.socialUserCreated });
                }
            });
        }

        // If user already exists
        if (result.length > 0) {

            // If the next action is OTP verification send to asking mobile number in front end
            if (result[0].next_action === 'OTP Verification') {
                return res.status(400).send({ msg: messages.otpVerificationNotCompleted });
            }

            // If the next action is email verification, update it to null and login the user
            if (result[0].next_action === 'Email Verification') {
                userQueries.updateNextActionAndSocialSignin(email, (err, updateResult) => {

                    if (err) {
                        return res.status(400).send({ msg: err.sqlMessage });
                    }
                    if (updateResult) {
                        const jwtToken = jwtTokenGenerator(req.body.email);

                        return res.status(200).send({
                            msg: messages.loginSuccess,
                            token: jwtToken,
                            role:result[0].role
                        });
                    }
                });
            }

            // If a user already exists and has both OTP and email verified, we will update their social signin as true and login
            if (!(result[0].next_action)) {
                userQueries.updateIsSocialLogin(email, (err, updateResult) => {
                    if (err) {
                        return res.status(400).send({ msg: err.sqlMessage });
                    }
                    if (updateResult) {
                        const jwtToken = jwtTokenGenerator(req.body.email);

                        return res.status(200).send({
                            msg: messages.loginSuccess,
                            token: jwtToken,
                            role:result[0].role
                        });
                    }
                });
            }

            // If a user comes and both their social signin and next action are null, we will simply login
            if (!(result[0].next_action) && result[0].is_social_sigin) {
                const jwtToken = jwtTokenGenerator(req.body.email);

                return res.status(200).send({
                    msg: messages.loginSuccess,
                    token: jwtToken,
                    role:result[0].role
                });
            }

        }
    });
}

module.exports = { oAuthLogin };
