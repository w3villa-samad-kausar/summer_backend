const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const jwtTokenGenerator=(data)=>{
    const id=data.id
    const email=data.email
    const role=data.role
    const name=data.name
    const plan=data.plan
    const jwtToken = jsonwebtoken.sign({ id,email,role,name,plan }, jwtSecret, { expiresIn: "1h" })

    return jwtToken;

}

module.exports=jwtTokenGenerator