const userQueries = require('../../queries/userQueries');
const messages = require('../../messages/messages.json');

const verifyEmail = (req, res) => {
    let token, email;

    // Handle both GET and POST requests
    if (req.method === 'GET') {
        token = req.query.token;
        email = req.query.email;
    } else if (req.method === 'POST') {
        token = req.body.token;
        email = req.body.email;
    }

    if (!token || !email) {
        return renderHtmlResponse(res, 400, messages.invalidVerificationLink);
    }

    const verificationHash = token;

    userQueries.checkEmailVerificationHash(verificationHash, (err, result) => {
        if (err) {
            console.error(messages.databaseQueryError, err);
            return renderHtmlResponse(res, 500, messages.databaseQueryError);
        }

        if (!result || !result.length) {
            return renderHtmlResponse(res, 400, messages.invalidVerificationLink);
        }

        const verificationRecord = result[0];
        const currentTime = new Date();

        if (currentTime > new Date(verificationRecord.email_expire_at)) {
            return renderHtmlResponse(res, 400, messages.emailVerificationTimeExpired);
        }

        userQueries.updateEmailVerifiedStatus(verificationHash, email, (err, updateResult) => {
            if (err) {
                console.error(messages.databaseUpdateError, err);
                return renderHtmlResponse(res, 500, messages.databaseUpdateError);
            }

            return renderHtmlResponse(res, 200, messages.emailVerified);
        });
    });
};

const renderHtmlResponse = (res, statusCode, message) => {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f0f0f0;
                }
                .container {
                    text-align: center;
                    padding: 20px;
                    background-color: white;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: ${statusCode === 200 ? 'green' : 'red'};
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${statusCode === 200 ? 'Success' : 'Error'}</h1>
                <p>${message}</p>
            </div>
        </body>
        </html>
    `;

    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
};

module.exports = { verifyEmail };