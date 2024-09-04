const admin = require('firebase-admin');

const sendNotification = async (req, res) => {
  const { deviceToken, title, body, data } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data || {}, // Optional custom data
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, message: 'Notification sent successfully', response });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification', error: error.message });
  }
};

module.exports = {
  sendNotification,
};
