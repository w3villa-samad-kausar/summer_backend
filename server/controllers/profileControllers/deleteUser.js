const profileQueries = require('../../queries/profileQueries');
const messages = require('../../messages/messages.json');

const deleteUser = async (req, res) => {
    try {
        const userId = req.user.email; // Assuming user ID is stored in req.user

        // Fetch the current user data to check if the user exists
        profileQueries.getUserById(userId, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ msg: 'Error fetching user data' });
            }
            if (result.length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Perform the deletion
            profileQueries.deleteUserById(userId, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ msg: 'Error deleting user' });
                }

                // Delete the corresponding record from the user_verification_table
                profileQueries.deleteUserVerificationById(userId, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ msg: 'Error deleting user verification record' });
                    }

                    res.status(200).json({ msg: 'User deleted successfully' });
                });
            });
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', err });
    }
};

module.exports = {
    deleteUser,
};
