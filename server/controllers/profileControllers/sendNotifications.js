const admin = require('firebase-admin');
const profileQueries = require('../../queries/profileQueries');

const sendNotificationCallback = async (userId, title, body, data) => {
    try {
        // Fetch the device token from the database
        profileQueries.getDeviceTokenByUserId(userId, async (err, result) => {
            if (err) {
                console.log('Error fetching device token:', err);
                return { success: false, message: 'Failed to fetch device token', error: err };
            }
            const deviceToken = result[0]?.fcm_token;

            if (!deviceToken) {
                console.error('No device token found for user:', userId);
                return { success: false, message: 'No device token found for user' };
            }

            // Create the message payload
            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                data: data || {}, // Optional custom data
                token: deviceToken, // Ensure deviceToken is a valid string
            };

            // Send the notification
            try {
                const response = await admin.messaging().send(message);
                console.log('Notification sent successfully:', response);
                return { success: true, message: 'Notification sent successfully', response };
            } catch (sendError) {
                console.error('Error sending notification:', sendError);
                return { success: false, message: 'Failed to send notification', error: sendError.message };
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return { success: false, message: 'Unexpected error occurred', error: error.message };
    }
};

module.exports = {
    sendNotificationCallback,
};
