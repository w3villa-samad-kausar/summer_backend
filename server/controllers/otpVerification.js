
const crypto = require('crypto');
const db = require('../config/db_config');

const verifyOtp = (req, res) => {
    const mobileNumber = req.body.mobileNumber;
    const userOtp = req.body.otp;

    //verification hash ki jagah mobile number use krna hai unique user ko identify krne me
    
    
    // console.log(verificationHash);
    
    db.query(`SELECT * FROM user_verification_table WHERE mobile_number = ?`, [mobileNumber], (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database query error' });
        }
        
        if (!result || !result.length) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        
        const verificationRecord = result[0];
        const currentTime = new Date();
        const userData = verificationRecord.user_data;

        // Check if the current time is before the expiration time
        if (currentTime > new Date(verificationRecord.mobile_otp_expire_at)) {
            return res.status(400).json({ msg: 'OTP verification time expired' });
        }


        // Check if the OTP matches
        if (userOtp !== verificationRecord.mobile_otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        db.beginTransaction((err) => {
            if (err) {
                console.error('Database transaction error:', err);
                return res.status(500).json({ msg: 'Database transaction error' });
            }

            db.query(`UPDATE user_verification_table SET is_mobile_verified = true, mobile_verified_at = NOW(), is_processed = TRUE WHERE mobile_number = ?`, [mobileNumber], (err, updateResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Database update error:', err);
                        return res.status(500).json({ msg: 'Database update error' });
                    });
                }

                db.query(`INSERT INTO user_table (name, email, password, mobile_number) VALUES (?, ?, ?, ?)`, 
                    [userData.name, userData.email, userData.password, userData.mobileNumber], 
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

                            return res.status(200).json({ msg: 'OTP verified and user created successfully' });
                        });
                    }
                );
            });
        });
        
})  
    
};

module.exports = { verifyOtp };
