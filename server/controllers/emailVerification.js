const crypto = require('crypto');
const db = require('../config/db_config');

const verifyEmail = (req, res) => {
    const token = req.query.token;

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
        if (currentTime > new Date(verificationRecord.expire_at)) {
            return res.status(400).json({ msg: 'Email verification time expired' });
        }

        // Log the user_data to check its content
        console.log('user_data:', verificationRecord.user_data);

        const userData = verificationRecord.user_data;

        // Update email verification status and insert user data in a transaction
        db.beginTransaction((err) => {
            if (err) {
                console.error('Database transaction error:', err);
                return res.status(500).json({ msg: 'Database transaction error' });
            }

            db.query(`UPDATE user_verification_table SET is_email_verified = true, email_verified_at = NOW(), is_processed = TRUE WHERE verification_hash = ?`, [verificationHash], (err, updateResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Database update error:', err);
                        return res.status(500).json({ msg: 'Database update error' });
                    });
                }

                db.query(`INSERT INTO user_table (name, email, password, mobile_number) VALUES (?, ?, ?, ?)`, 
                    [userData.username, userData.email, userData.password, userData.mobileNumber], 
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Database insert error:', err);
                                return res.status(500).json({ msg: 'Database insert error' });
                            });
                        }

                        db.commit((err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Database commit error:', err);
                                    return res.status(500).json({ msg: 'Database commit error' });
                                });
                            }

                            return res.status(200).json({ msg: 'Email verified and user created successfully' });
                        });
                    }
                );
            });
        });
    });
};

module.exports = { verifyEmail };
