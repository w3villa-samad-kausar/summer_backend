const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const jwtTokenGenerator = require("../helpers/jwtTokenGenerator");

const oAuthLogin = (req, res) => {
    const email = req.body.email
    const name = req.body.name

    userQueries.checkUserByEmailInUser_Table(email, async (err, result) => {

        //database query error
        if (err) {
            return res.status(400).send({ msg: err });
        }

        //if user doesnt exist
        if (!result.length) {
            const userData = JSON.stringify({
                name: name,
                email: email,
            });
            userQueries.insertSocialUser(email, userData, (err, result) => {
                //database query error
                if (err) {
                    return res.status(400).send({ msg: err });
                }
                //if user created successfully then send them to asking number page
                if (result) {
                    return res.status(200).send({ msg: messages.socialUserCreated })
                }

            })
        }
        //if user already exixts
        if (result.length > 0) {

            // if the next action is otp verification send to asking mobile number in front end
            if (result[0].next_action === 'OTP Verification') {
                return res.status(400).send({ msg: messages.otpVerificationNotCompleted })
            }
            // if the next action is email verification, update it to null and login the user
            if (result[0].next_action === 'Email Verification') {
                userQueries.updateNextActionAndSocialSignin(email, (err, result) => {
                    if (err) {
                        return res.status(400).send({ msg: err });
                    }
                    if (result) {
                        const jwtToken = jwtTokenGenerator(req.body.email)

                        return res.status(200).send({
                            msg: messages.loginSuccess,
                            token: jwtToken,
                            user: result[0].id
                        });
                    }

                })
                // if a user already exists and has both otp and email verified, we will update their social signin as true and login
                if (!result[0].next_action) {
                    userQueries.updateIsSocialLogin(email, (err, result) => {
                        if (err) {
                            return res.status(400).send({ msg: err });
                        }
                        if (result) {
                            const jwtToken = jwtTokenGenerator(req.body.email)

                            return res.status(200).send({
                                msg: messages.loginSuccess,
                                token: jwtToken,
                                user: result[0].id
                            });

                        }
                    })
                }

                // if a user comes and both his social signin and next action is null , we will simply login
                if (!result[0].next_action && result[0].is_social_sigin) {

                    const jwtToken = jwtTokenGenerator(req.body.email)

                    return res.status(200).send({
                        msg: messages.loginSuccess,
                        token: jwtToken,
                        user: result[0].id
                    });
                }

            }
        }


    })
}

module.exports = { oAuthLogin }