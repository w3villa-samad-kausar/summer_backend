const { validationResult } = require("express-validator");
const db = require("../config/db_config");
const bcrypt = require("bcrypt");

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


const login =async(req ,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    db.query(
        `SELECT * FROM user_table WHERE email=${db.escape(req.body.email)};`,
        (err, result) => {
            if (err){
                return res.status(400).send({
                    msg:err
                })
            }
            if(!result.length){
                return res.status(400).send({
                    msg:'Invalid email or password 123'
                })
            }
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bcryptError,bcrytResult)=>{
                    if (bcryptError){
                        return res.status(400).send({
                            msg:err
                        })
                    }
                    if(!bcrytResult){
                        return res.status(402).send({
                            msg:"invalid password"
                        })
                    }
                    if (bcrytResult){
                        const jwtToken=jsonwebtoken.sign({id:result[0]['id']}, jwtSecret ,{ expiresIn:"1h" });
                        console.log(jwtToken);
                        
                        
                        return res.status(200).send({
                            msg:'user login success',
                            token:jwtToken,
                            user:result[0]
                        })
                    }
                }
                
            )
            // return res.status(400).send({
            //     msg:'Invalid email or password abcd'
            // })
        }
    )
}

module.exports={login}