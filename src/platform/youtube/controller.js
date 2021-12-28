
const { OAuthCallback, OAuthRequest } = require("./service")
const client_secret = require('./client_secret.json')

const OAuthCallbackController = async (req, res, next) => {
    const result = await OAuthCallback({
        code: req.query.code
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const OAuthRequestController = async (req, res, next) => {
    const result = await OAuthRequest({})
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    OAuthCallbackController,
    OAuthRequestController
}