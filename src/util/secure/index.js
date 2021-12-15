const CryptoJs = require('crypto-js')

const encrypt = (data) => {
    var secureData = CryptoJs.AES.encrypt(data, process.env.SECRET_KEY).toString()
    return secureData
}

const decrypt = (secureData) => {
    var bytes = CryptoJs.AES.decrypt(secureData, process.env.SECRET_KEY)
    const data = bytes.toString(CryptoJs.enc.Utf8)
    return data
}
module.exports = {
    encrypt,
    decrypt
}