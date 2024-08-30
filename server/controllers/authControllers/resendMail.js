const crypto = require('crypto');
const sendMail = require("../../helpers/sendMail");
const userQueries = require("../../queries/userQueries");
const messages = require("../../messages/messages.json");
require('dotenv').config();

const resendEmailVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ msg: messages.emailRequired });
  }

  try {
    // Check if the email is already verified
    userQueries.checkEmailVerified(email, async (error, results) => {
      if (error) {
        console.error(messages.failedEmailVerification, error);
        return res.status(500).send({ msg: messages.failedEmailVerification, error });
      }

      if (results.length === 0) {
        return res.status(404).send({ msg: messages.userNotFound });
      }

      const { is_email_verified } = results[0];
      if (is_email_verified) {
        return res.status(400).send({ msg: messages.emailAlreadyVerified });
      }

      // Generate a new verification hash
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
      const emailExpireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Update the database with the new verification hash and expiry time
      userQueries.updateEmail(verificationHash, emailExpireAt, email, async (error, results) => {
        if (error) {
          console.error(messages.failedVerificationUpdate, error);
          return res.status(500).send({ msg: messages.failedVerificationUpdate, error });
        }

        // Construct the verification link with both token and email
        const verificationLink = `${process.env.EMAIL_VERIFICATION_LINK}?token=${verificationHash}&email=${encodeURIComponent(email)}`;

        // Send verification email
        const content = `<p>${messages.emailBody}<br/><a href="${verificationLink}">${messages.emailVerificationLinkText}</a></p>`;

        try {
          await sendMail(email, messages.emailSubject, content);
          return res.status(201).send({ msg: messages.emailResent, token: verificationHash });
        } catch (error) {
          console.error(messages.failedEmailSend, error);
          return res.status(500).send({ msg: messages.failedEmailSend, error });
        }
      });
    });
  } catch (error) {
    console.error(messages.errorProcessingRequest, error);
    return res.status(500).send({ msg: messages.failedEmailSend, error });
  }
};

module.exports = resendEmailVerification;