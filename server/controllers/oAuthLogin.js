const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const jwtTokenGenerator = require("../controllers/jwtTokenGenerator");

const oAuthLogin = (req, res) => {
    const email = req.body.email

    userQueries.checkUserByEmail(req.body.email, (err, result) => {
       //database query error
        if (err) {
            return res.status(400).send({ msg: messages.databaseQueryError });
        }

        //if user doesnt exist
        if (!result.length) {
            
        }

        //if user exists
        
        const jwtToken=jwtTokenGenerator(req.body.email)

            return res.status(200).send({
                msg: messages.loginSuccess,
                token: jwtToken,
                user: result[0]
            });
    })
}