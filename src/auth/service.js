const { encrypt, decrypt, generateToken, generateRandomToken } = require("../util/secure")

const User = require('../user/model')
const Token = require('./model')
const { sendRequestResetPasswordEmail } = require("../util/email")
const login = async (data) => {
    try {
        let {email, password} = data
        if (email == undefined || password == undefined) {
            throw new Error('Missing fields')
        }
        
        const user = await User.findOne({email})
        if (!user) {
            throw new Error('Email not found!')
        }

        const securePassword = decrypt(user.password)
        if (password != securePassword) {
            throw new Error('Password not correct')
        }

        const accessToken = generateToken({_id: user._id, isAdmin: user.isAdmin})
        let {...infor} = user._doc
        infor.password = null
        return {...infor, accessToken}
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const signup = async (data) => {
    try {
        const {email, password} = data
        if (email == undefined || password == undefined) {
            throw new Error('Missing fields')
        }
        const securePassword = encrypt(password)
        const newUser = new User({
            email,
            password: securePassword
        })
        const user = await newUser.save()
        return user
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}


const requestResetPassword = async (data) => {
    try {
        const {email} = data
        if (email == undefined) {
            throw new Error('Missing fields')
        }
        const user = await User.findOne({email})
        if (!user) {
            throw new Error('User not found')
        }

        const oldToken = await Token.findOne({userId: user._id})
        if (oldToken) await oldToken.deleteOne()

        let newToken = generateRandomToken()

        await new Token({
            userId: user._id,
            token: newToken
        }).save()

        const clientUrl = process.env.CLIENT_URL
        const resetLink = `${clientUrl}/auth/reset-password?token=${newToken}&id=${user._id}`

        sendRequestResetPasswordEmail(user, resetLink)

        // For dev-test
        return resetLink
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}


const resetPassword = async (data) => {
    return "resetPassword response"
}


const changePassword = async (data) => {
    return "changePassword response"
}


module.exports = {
    login,
    signup,
    requestResetPassword,
    resetPassword,
    changePassword
}