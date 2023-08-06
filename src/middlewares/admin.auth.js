require('dotenv').config()
const jwt = require('jsonwebtoken')
const tokenVerify = async (req, res, next)=>{
    const header = req.headers['authorization']
    const token = header && header.split(' ')[1]

    if(!token) {
        return res.status(403).send({
            statusCode: 403,
            success: false,
            message: 'Oops!!!, Unauthorized Access'
        })
    }
    jwt.verify(
        token,
        process.env.AUTH_ADMIN_TOKEN,
        (err,decoded)=>{
            if(err) return res.status(401).send({
                statusCode: 401,
                success: false,
                message: 'Invalid Token Detected'
            })

            req.admin_id = decoded.id
            next()
        }
    )
}

module.exports= tokenVerify