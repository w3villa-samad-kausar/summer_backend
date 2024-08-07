const { validationResult } = require("express-validator");
const db = require("../config/db_config");
const bcrypt = require("bcrypt");
const userQueries = require('../queries/userQueries');
const messages = require('../messages/messages.json');
const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    userQueries.checkUserByEmail(req.body.email, (err, result) => {
        if (err) {
            return res.status(400).send({ msg: messages.databaseQueryError });
        }

        if (!result.length) {
            return res.status(400).send({ msg: messages.invalidEmailOrPassword });
        }

        bcrypt.compare(req.body.password, result[0]['password'], (bcryptError, bcryptResult) => {
            if (bcryptError) {
                return res.status(400).send({ msg: messages.hashPasswordError });
            }

            if (!bcryptResult) {
                return res.status(402).send({ msg: messages.invalidPassword });
            }

            const jwtToken = jsonwebtoken.sign({ id: result[0]['id'] }, jwtSecret, { expiresIn: "1h" });
            return res.status(200).send({
                msg: messages.loginSuccess,
                token: jwtToken,
                user: result[0]
            });
        });
    });
};

module.exports = { login };