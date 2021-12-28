
const client_secret = require('./client_secret.json')
const OAuthCallback = async (data) => {
    try {
        const {code} = data 
        if (code == undefined) {
            throw new Error('User refuse granting permissions')
        }
        console.log("Permissions granted: ", code)
        return 'OK'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const OAuthRequest = async (data) => {
    try {
        const {} = data 
        const client_id = client_secret.web.client_id
        const redirect_uri = client_secret.web.redirect_uris[0]
        const response_type = 'code'
        const scope = 'https://www.googleapis.com/auth/youtube.readonly'
        const access_type = 'offline'
        const path = 'https://accounts.google.com/o/oauth2/auth'
        
        const url = `${path}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&response_type=${response_type}&access_type=${access_type}`
        console.log("URL:", url )
        return url
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

module.exports = {
    OAuthCallback,
    OAuthRequest
}
