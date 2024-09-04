const profileQueries = require('../../queries/profileQueries');
const { sendNotificationCallback } = require('./sendNotifications');

const updateUserPlan = async (req, res) => {
    try {
        const userId = req.user.email; // Assuming user is authenticated and `req.user` contains user data
        const { plan } = req.body; // Plan should be sent in the request body

        if (!plan) {
            return res.status(400).json({ msg: 'Plan is required' });
        }

        profileQueries.updateUserPlan(userId, plan, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error updating user plan' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ msg: 'User not found' });
            } else {
                sendNotificationCallback(userId,"Plan Updated",`You are now a ${plan} user`)
                return res.status(200).json({ msg: 'User plan updated successfully' });
            }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error.', err });
    }
};

module.exports = {
    updateUserPlan, // Export the new function
};
