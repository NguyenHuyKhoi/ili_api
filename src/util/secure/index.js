const CryptoJs = require('crypto-js')
const Crypto = require('crypto')
const jwt = require('jsonwebtoken')

const encrypt = (data) => {
    var secureData = CryptoJs.AES.encrypt(data, process.env.SECRET_KEY).toString()
    return secureData
}

const decrypt = (secureData) => {
    var bytes = CryptoJs.AES.decrypt(secureData, process.env.SECRET_KEY)
    const data = bytes.toString(CryptoJs.enc.Utf8)
    return data
}

const generateToken = (data) => {
    const token = jwt.sign(
        {...data},
        process.env.SECRET_KEY,
        {expiresIn: '30d'}
    )
    return token
}

const generateRandomToken = () => {
    const data = Crypto.randomBytes(32).toString('hex')
    return generateToken(data)
}
module.exports = {
    encrypt,
    decrypt,
    generateToken,
    generateRandomToken
}