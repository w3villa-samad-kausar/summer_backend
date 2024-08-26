const axios = require('axios'); // Using Axios for HTTP requests
require('dotenv').config();

const acesstoken = process.env.MAP_ACCESS_TOKEN;

const adressAutoComplete = async (req, res) => {
    const query = req.query.q

    // Construct the URL using the access token from environment variables
    const url = `https://api.locationiq.com/v1/autocomplete?key=${acesstoken}&q=${query}`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching autocomplete data' });
    }
};

module.exports = adressAutoComplete;
