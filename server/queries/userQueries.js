const db = require('../config/db_config');

const checkEmailExistsInUser_Verification_table = (email, callback) => {
    db.query(`SELECT * FROM user_verification_table WHERE LOWER(email) = LOWER(${email});`, callback);
};

const insertUserVerification = (uniqueReferenceId, verificationHash, userData, mobileOtp, email, mobileNumber, callback) => {
    const query = `
        INSERT INTO user_verification_table (
            unique_reference_id, verification_hash, user_data, email_expire_at, mobile_otp_expire_at, mobile_otp, email, mobile_number
        ) VALUES (
            ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), DATE_ADD(NOW(), INTERVAL 2 MINUTE), ?, ?, ?
        )`;
    db.query(query, [uniqueReferenceId, verificationHash, userData, mobileOtp, email, mobileNumber], callback);
};

const checkUserByEmailInUser_Table = (email, callback) => {
    db.query(`SELECT * FROM user_table WHERE email=${db.escape(email)};`, callback);
};

const checkUserByMobileNumber = (mobileNumber, callback) => {
    db.query(`SELECT * FROM user_verification_table WHERE mobile_number=${db.escape(mobileNumber)};`,callback)
}

const checkMobileVerified = (mobileNumber, callback) => {
    const selectQuery = `SELECT is_mobile_verified FROM user_verification_table WHERE mobile_number = ?`;
    db.query(selectQuery, [mobileNumber], callback);
};

const updateOtp = (mobileOtp, mobileOtpExpireAt, mobileNumber, callback) => {
    const updateQuery = `
        UPDATE user_verification_table
        SET mobile_otp = ?, mobile_otp_expire_at = ?, otp_retry_count = otp_retry_count + 1
        WHERE mobile_number = ?
    `;
    db.query(updateQuery, [mobileOtp, mobileOtpExpireAt, mobileNumber], callback);
};

const checkEmailVerified = (email, callback) => {
    const selectQuery = `SELECT is_email_verified FROM user_verification_table WHERE email = ?`;
    db.query(selectQuery, [email], callback);
};
const updateEmail = (verificationHash, emailExpireAt, email, callback) => {
    const updateQuery = `
        UPDATE user_verification_table
        SET verification_hash = ?, email_expire_at = ?, email_retry_count = email_retry_count + 1
        WHERE email = ?
      `;
    db.query(updateQuery, [verificationHash, emailExpireAt, email], callback);
};

const updateMobileVerifiedStatus = (mobileNumber, callback) => {
    const updateQuery = `
        UPDATE user_verification_table 
        SET is_mobile_verified = true, mobile_verified_at = NOW(), is_processed = TRUE 
        WHERE mobile_number = ?
    `;
    db.query(updateQuery, [mobileNumber], callback);
};

const insertUser = (userData, callback) => {
    const insertQuery = `
        INSERT INTO user_table (name, email, password, mobile_number,next_action) 
        VALUES (?, ?, ?, ?,"Email Verification")
    `;
    db.query(insertQuery, [userData.name, userData.email, userData.password, userData.mobileNumber], callback);
};


const checkEmailVerificationHash = (verificationHash, callback) => {
    const selectQuery = `
        SELECT * FROM user_verification_table 
        WHERE verification_hash = ?
    `;
    db.query(selectQuery, [verificationHash], callback);
};

const updateEmailVerifiedStatus = (verificationHash, email, callback) => {
    const updateVerificationQuery = `
        UPDATE user_verification_table 
        SET is_email_verified = true, email_verified_at = NOW() 
        WHERE verification_hash = ?
    `;
    
    const updateNextActionQuery = `
        UPDATE user_table 
        SET next_action = NULL 
        WHERE email = ?
    `;
    
    db.beginTransaction((err) => {
        if (err) return callback(err);

        db.query(updateVerificationQuery, [verificationHash], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    callback(err);
                });
            }

            db.query(updateNextActionQuery, [email], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        callback(err);
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            callback(err);
                        });
                    }
                    callback(null, result);
                });
            });
        });
    });
};


module.exports = {
    checkEmailExistsInUser_Verification_table,
    insertUserVerification,
    checkUserByEmailInUser_Table,
    checkUserByMobileNumber,
    checkMobileVerified,
    updateOtp,
    checkEmailVerified,
    updateEmail,
    updateMobileVerifiedStatus,
    insertUser,
    checkEmailVerificationHash,
    updateEmailVerifiedStatus
};
