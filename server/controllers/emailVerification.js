const crypto = require('crypto');
const db = require('../config/db_config');

const verifyEmail = (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ msg: 'Invalid verification link' });
    }

    const verificationHash = token;

    db.query(`SELECT * FROM user_verification_table WHERE verification_hash = ?`, [verificationHash], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database query error' });
        }

        if (!result || !result.length) {
            return res.status(400).json({ msg: 'Invalid verification link' });
        }

        const verificationRecord = result[0];
        const currentTime = new Date();

        // Check if the current time is before the expiration time
        if (currentTime > new Date(verificationRecord.email_expire_at)) {
            return res.status(400).json({ msg: 'Email verification time expired' });
        }


        db.query(`UPDATE user_verification_table SET is_email_verified=true WHERE verification_hash = ?`, [verificationHash], (err, updateResult) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).json({ msg: 'Database update error' });
            }
    
           
        });
    
        
    
        db.query(`UPDATE user_verification_table SET email_verified_at = NOW() WHERE verification_hash = ?`, [verificationHash], (err, updateResult) => {
            if (err) {
                console.error('Database update error:', err);
                return res.status(500).json({ msg: 'Database update error' });
            }
    
            return res.status(200).json({ msg: 'Email verified successfully' });
        });
    
})

    
};

module.exports = { verifyEmail };
