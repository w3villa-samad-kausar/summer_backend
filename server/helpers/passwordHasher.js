const bcrypt = require('bcrypt');

/**
 * Hashes the password using bcrypt.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
}

module.exports = { hashPassword };
