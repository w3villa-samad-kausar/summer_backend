const profileQueries = require('../../queries/profileQueries')
const getUserData = async (req, res) => {
    try {
        const userId = req.user.email;
        profileQueries.getUserById(userId, (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ message: 'Error fetching user data' })
            }
            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' })
            }
            else {
                res.status(200).json(result);
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', err });
    }
};

module.exports = {
    getUserData,
};