const db = require('../config/db_config');

const checkEmailExists = (email, callback) => {
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

const checkUserByEmail = (email, callback) => {
    db.query(`SELECT * FROM user_table WHERE email=${db.escape(email)};`, callback);
};


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
}


module.exports = {
    checkEmailExists,
    insertUserVerification,
    checkUserByEmail,
    checkMobileVerified,
    updateOtp,
    checkEmailVerified,
    updateEmail
};
