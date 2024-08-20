const db = require('../config/db_config');

const getUserById = async (userId,callback) => {
    
    const query = `SELECT * FROM user_table WHERE email = ?`;
    db.query(query, [userId], callback)
};

module.exports = {
    getUserById,
};