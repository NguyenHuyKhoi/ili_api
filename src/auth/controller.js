const { login, signup, requestResetPassword, resetPassword, changePassword, logout } = require("./service")

const loginController = async (req, res, next) => {
    const result = await login(req.body)
    console.log("Result login:", result)
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const logoutController = async (req, res, next) => {
    console.log("User Id in logout :", req.user._id)
    const result = await logout({
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const signupController = async (req, res, next) => {
    const {email, password} = req.body

    const result = await signup({
        email,
        password
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const requestResetPasswordController = async (req, res, next) => {
    const {email} = req.body
    const result = await requestResetPassword({
        email
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const resetPasswordController = async (req, res, next) => {
    const result = await resetPassword({
        userId: req.user._id,
        token: req.query.token,
        newPassword: req.body.password
    })

    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const changePasswordController = async (req, res, next) => {
    const result = await changePassword({
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
        userId: req.user._id
    })
    return  res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    loginController,
    logoutController,
    signupController,
    requestResetPasswordController,
    resetPasswordController,
    changePasswordController
}