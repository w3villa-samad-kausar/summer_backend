const crypto = require('crypto');
const sendMail = require("../helpers/sendMail");
const db = require("../config/db_config");

const resendEmailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ msg: 'Email is required' });
  }

  try {
    // Check if the email is already verified
    const selectQuery = `
      SELECT is_email_verified FROM user_verification_table
      WHERE email = ?
    `;

    db.query(selectQuery, [email], async (error, results) => {
      if (error) {
        console.error('Error checking email verification:', error);
        return res.status(500).send({ msg: 'Failed to check email verification', error });
      }

      if (results.length === 0) {
        return res.status(404).send({ msg: 'User not found' });
      }

      const { is_email_verified } = results[0];
      if (is_email_verified) {
        return res.status(400).send({ msg: 'Email is already verified' });
      }

      // Generate a new verification hash
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
      const emailExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Update the database with the new verification hash and expiry time
      const updateQuery = `
        UPDATE user_verification_table
        SET verification_hash = ?, email_expire_at = ?
        WHERE email = ?
      `;

      db.query(updateQuery, [verificationHash, emailExpireAt, email], async (error, results) => {
        if (error) {
          console.error('Error updating verification hash:', error);
          return res.status(500).send({ msg: 'Failed to update verification hash', error });
        }

        // Send verification email
        const mailSubject = 'Email Verification';
        const content = `<p>Please click the link below to verify your email:<br/><a href="http://localhost:3000/verify-email?token=${verificationToken}">Verify</a></p>`;

        try {
          await sendMail(email, mailSubject, content);
          return res.status(201).send({ msg: 'Verification email resent. Please check your inbox', token: verificationHash });
        } catch (error) {
          console.error('Error sending verification email:', error);
          return res.status(500).send({ msg: 'Failed to send verification email', error });
        }
      });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send({ msg: 'Failed to resend verification email', error });
  }
};

module.exports = resendEmailVerification;
