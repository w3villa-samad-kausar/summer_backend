const db = require('../config/db_config');

const getUserById = async (userId,callback) => {
    
    const query = `SELECT * FROM user_table WHERE email = ?`;
    db.query(query, [userId], callback)
};

const updateUserProfilePicture = (userId, url, callback) => {
    const query = `UPDATE user_table SET profile_picture_url = ? WHERE email = ?`;
    db.query(query, [url, userId], callback);
};

const updateUserById = (userId, fieldsToUpdate, callback) => {
    const keys = Object.keys(fieldsToUpdate);
    const values = keys.map((key) => fieldsToUpdate[key]);

    // Construct the SQL query dynamically based on the fields to update
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const sql = `UPDATE user_table SET ${setClause} WHERE email = ?`;

    // Add the userId to the end of the values array for the WHERE clause
    values.push(userId);

    db.query(sql, values, callback);
};

const deleteUserById = (userId, callback) => {
    const query = 'DELETE FROM user_table WHERE email = ?';
    db.query(query, [userId], callback);
};

const deleteUserVerificationById = (userId, callback) => {
    const query = 'DELETE FROM user_verification_table WHERE email = ?';
    db.query(query, [userId], callback);
};

const updateUserPlan = (userId, plan, callback) => {
    const sql = 'UPDATE user_table SET plan = ? WHERE email = ?';
    db.query(sql, [plan, userId], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
};

module.exports = {
    getUserById, 
    updateUserById, 
    updateUserProfilePicture,
    deleteUserById,
    deleteUserVerificationById,
    updateUserPlan
};

