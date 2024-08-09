const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const jwtTokenGenerator=(email)=>{
    const jwtToken = jsonwebtoken.sign({ email }, jwtSecret, { expiresIn: "1h" })

    return jwtToken;

}

module.exports=jwtTokenGenerator