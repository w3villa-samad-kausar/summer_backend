const profileQueries = require('../../queries/profileQueries');

const insertFcmToken = async (req, res) => {
    try {
        const userId = req.user.email; // Assuming user is authenticated and `req.user` contains user data
        const { token } = req.body; // Plan should be sent in the request body

        if (!token) {
            return res.status(400).json({ msg: 'Token is required' });
        }

        profileQueries.insertFcmToken(userId, token, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error updating fcm token' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'User not found' });
            } else {
                return res.status(200).json({ msg: 'fcm token updated successfully' });
            }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error.', err });
    }
};

module.exports = {
    insertFcmToken, // Export the new function
};
