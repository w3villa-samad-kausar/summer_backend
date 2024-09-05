const db = require('../config/db_config');

const checkEmailExistsInUser_Verification_table = (email, callback) => {
    db.query(`SELECT * FROM user_verification_table WHERE email = "${email}";`, callback);
};

const insertUserVerification = (userData, mobileOtp, email, mobileNumber, callback) => {
    const query = `
        INSERT INTO user_verification_table (
            user_data, mobile_otp_expire_at, mobile_otp, email, mobile_number
        ) VALUES (
            ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), ?, ?, ?
        )`;
    db.query(query, [userData, mobileOtp, email, mobileNumber], callback);
};

const updateUserVerification = (userData, mobileOtp, mobileNumber, email, callback) => {
    const query = `
        UPDATE user_verification_table 
        SET user_data=?, mobile_otp_expire_at=DATE_ADD(NOW(),INTERVAL 5 MINUTE),mobile_otp=?,mobile_number=?
        WHERE email = ?`;
    db.query(query, [userData, mobileOtp, mobileNumber, email], callback);
};


const checkUserByEmailInUser_Table = (email, callback) => {
    db.query(`SELECT * FROM user_table WHERE email=?;`,[email], callback);
};

const checkUserByMobileNumber = (mobileNumber, callback) => {
    db.query(`SELECT * FROM user_verification_table WHERE mobile_number=?;`,[mobileNumber], callback)
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
    "name":"Samad Kaus
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

const insertSocialUser = (email, userData, callback) => {
    const insertQuery = `
    INSERT INTO user_verification_table (user_data,email,is_social_signin)
    VALUES (?,?,true)
    `;
    db.query(insertQuery, [userData, email], callback);
};

const insertSocialUserInUser_Table = (userData,mobileNumber, callback) => {
    const insertQuery = `
        INSERT INTO user_table (name, email, mobile_number,next_action,is_social_signin) 
        VALUES (?, ?, ?,null,true)
    `;
    db.query(insertQuery, [userData.name, userData.email, mobileNumber], callback);
};


const insertOtp=(email,mobileNumber,mobileOtp,mobileOtpExpireAt,callback)=>{
    const updateQuery=`
    UPDATE user_verification_table 
    SET mobile_number = ?,mobile_otp = ?,mobile_otp_expire_at = ?
    WHERE email = ?
    `;
    db.query(updateQuery,[mobileNumber,mobileOtp,mobileOtpExpireAt,email],callback)
};

const updateIsSocialLogin=(email,callback)=>{
    const updateQuery = `
    UPDATE user_table 
        SET is_social_signin = true 
        WHERE email = ?
    `;
    db.query(updateQuery, [email], callback);
}

const updateNextActionAndSocialSignin=(email,callback)=>{
    const updateQuery = `
    UPDATE user_table 
        SET next_action = NULL , is_social_signin = true
        WHERE email = ?
    `;
    db.query(updateQuery, [email], callback);
}


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
    insertSocialUser,
    insertSocialUserInUser_Table,
    checkEmailVerificationHash,
    updateEmailVerifiedStatus,
    updateUserVerification,
    updateIsSocialLogin,
    updateNextActionAndSocialSignin,
    insertOtp
};
