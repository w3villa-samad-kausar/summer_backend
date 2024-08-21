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
module.exports = {
    getUserById, 
    updateUserById, 
    updateUserProfilePicture
};

