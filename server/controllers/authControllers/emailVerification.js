const userQueries = require('../../queries/userQueries');
const messages = require('../../messages/messages.json');
const verifyEmail = (req, res) => {
    const token = req.body.token;
    const email=req.body.email

    if (!token) {
        return res.status(400).json({ msg: messages.invalidVerificationLink });
    }

    const verificationHash = token;

    userQueries.checkEmailVerificationHash(verificationHash, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return res.status(500).json({ msg: messages.databaseQueryError });
        }

        if (!result || !result.length) {
            return res.status(400).json({ msg: messages.invalidVerificationLink });
        }

        const verificationRecord = result[0];
        const currentTime = new Date();

        if (currentTime > new Date(verificationRecord.email_expire_at)) {
            return res.status(400).json({ msg: messages.emailVerificationTimeExpired });
        }

        userQueries.updateEmailVerifiedStatus(verificationHash,email, (err, updateResult) => {
            if (err) {
                console.error(messages.databaseUpdateError, err);
                return res.status(500).json({ msg: messages.databaseUpdateError });
            }

            return res.status(200).json({ msg: messages.emailVerified });
        });
    });
};

module.exports = { verifyEmail };
