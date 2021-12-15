const { encrypt, decrypt } = require("../util/secure")
const jwt = require('jsonwebtoken')

const User = require('../user/model')
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

        const accessToken = jwt.sign(
            {_id: user._id, isAdmin: user.isAdmin},
            process.env.SECRET_KEY,
            {expiresIn: '30d'}
        )
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


const forgotPassword = async (data) => {
    return "forgotPassword response"
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
    forgotPassword,
    resetPassword,
    changePassword
}