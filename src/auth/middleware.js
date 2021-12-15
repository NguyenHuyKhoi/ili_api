const jwt = require('jsonwebtoken')
let isAuth = async (req, res, next) => {
    const tokenFromClient = req.body.token || req.query.token || req.headers['x-access-token']
    if (tokenFromClient) {
        jwt.verify(tokenFromClient, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(401).json('Unauthorized') 
            }
            else {
                req.user = user
                next()
            }
        })
    }
    else {
        return res.status(403).json('No token provided')
    }
}

module.exports = {
    isAuth
}