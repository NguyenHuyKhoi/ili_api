const { encrypt, decrypt, generateToken } = require("../util/secure")

const User = require('../user/model')
const Token = require('./model')
const { sendRequestResetPasswordEmail, sendCompleteResetPasswordEmail } = require("../util/email")
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

        await Token.findOneAndDelete({userId: user._id})
        await new Token({
            userId: user._id,
            token: accessToken
        }).save()

        return {...infor, accessToken}
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const logout = async (data) => {
    try {
        let {userId} = data
        if (userId == undefined) {
            throw new Error('Missing fields')
        }

        await Token.findOneAndDelete({userId})

        return true
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const userGenerator = (email) => {
    var offset = email.indexOf('@')
    var username = offset == -1 ? 'User_' + Math.round(Math.random()*1000) : email.substring(0, offset)
    return username
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
            password: securePassword,
            username: userGenerator(email)
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
            throw new Error('This email has not been registed.')
        }

        const oldToken = await Token.findOne({userId: user._id})
        if (oldToken) await oldToken.deleteOne()

        let newToken = generateToken({
            _id: user._id,
            isAdmin: user.isAdmin
        })

        await new Token({
            userId: user._id,
            token: newToken
        }).save()

        const clientUrl = process.env.CLIENT_URL
        const resetLink = `${clientUrl}/auth/reset-password?token=${newToken}`

        sendRequestResetPasswordEmail(user, resetLink)

        // For dev-test
        return resetLink
    }
    catch (err) {
        console.log("Err request reset :", err)
        return {
            error: err.message
        }
    }
}

const resetPassword = async (data) => {
    try {
        const {userId, token, password} = data
        console.log("Reset data", data)
        if (userId == undefined || token == undefined || password == undefined) {
            throw new Error('Missing fields')
        }
        
        let savedToken = await Token.findOne({userId})
        if (!savedToken) {
            throw new Error('Token of this user not exist or used')
        }

        if (savedToken.token != token) {
            throw new Error('Token is invalid')
        }

        const securePassword = encrypt(password)

        await User.updateOne(
            { _id: userId },
            { $set: { password: securePassword}},
            { new: true}
        )
        
        const user = await User.findById({ _id: userId})

        sendCompleteResetPasswordEmail(user)
        await savedToken.deleteOne()
        return {
            message: 'Change password success'
        }

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const changePassword = async (data) => {
    try {
        console.log("Field:", data)
        const {oldPassword, newPassword, userId} = data
        if (oldPassword == undefined || newPassword == undefined ) {
            throw new Error('Missing fields')
        }

        const user = await User.findOne({_id: userId})
        if (!user) {
            throw new Error('User not exist')
        }

        const savedPassword = decrypt(user.password)

        if (savedPassword != oldPassword) {
            throw new Error('Old password not correct')
        }

        const secureNewPassword = encrypt(newPassword)

        await User.updateOne(
            { _id: userId },
            { $set: { password: secureNewPassword}},
            { new: true}
        )

        return 'Password has change'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

module.exports = {
    login,
    logout,
    signup,
    requestResetPassword,
    resetPassword,
    changePassword
}