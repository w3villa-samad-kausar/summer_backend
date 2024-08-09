const crypto = require('crypto');

/**
 * Generates a verification token and its hash.
 * @returns {{ string }} - An object containing the hash.
 */
function generateVerificationToken() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    return  verificationHash 
}

module.exports = { generateVerificationToken };
