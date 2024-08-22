const profileQueries = require('../../queries/profileQueries');
const messages = require('../../messages/messages.json');

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.email; // Assuming user ID is stored in req.user
        const updatedData = req.body;

        // Fetch the current user data
        profileQueries.getUserById(userId, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error fetching user data' });
            }
            if (result.length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const currentUserData = result[0];
            const fieldsToUpdate = {};

            // Check which fields have changed and need updating
            Object.keys(updatedData).forEach((field) => {
                if (updatedData[field] !== currentUserData[field]) {
                    fieldsToUpdate[field] = updatedData[field];
                }
            });

            // If there are no fields to update, return a 400 response
            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({ msg: 'No changes detected' });
            }

            // Perform the update
            profileQueries.updateUserById(userId, fieldsToUpdate, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ msg: 'Error updating user data' });
                }

                res.status(200).json({ msg: 'Profile updated successfully' });
            });
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', err });
    }
};

module.exports = {
    updateUserProfile,
};
