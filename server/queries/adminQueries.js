const db = require('../config/db_config'); // Assuming you have a db connection file

const getUsersWithPagination = (limit, offset, callback) => {
    const query = `SELECT id, name, email, profile_picture_url FROM user_table WHERE role = 'USER' LIMIT ? OFFSET ?`;
    db.query(query, [limit, offset], callback);
};

module.exports = {
    getUsersWithPagination,
};