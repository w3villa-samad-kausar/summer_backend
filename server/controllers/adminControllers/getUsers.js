const adminQueries = require('../../queries/adminQueries');

const getUsers = async (req, res) => {
    try {
        const limit = req.body.limit;
        const offset= req.body.offset;
        adminQueries.getUsersWithPagination(limit, offset, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: 'Error fetching users' });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', err });
    }
};

module.exports = {
    getUsers,
};
