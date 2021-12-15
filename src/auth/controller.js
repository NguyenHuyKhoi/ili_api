const { login, signup, forgotPassword, resetPassword, changePassword } = require("./service")

const loginController = async (req, res, next) => {
    const result = await login(req.body)
    return res.json(result)
}

const signupController = async (req, res, next) => {
    const {email, password} = req.body

    const result = await signup({
        email,
        password
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const forgotPasswordController = async (req, res, next) => {
    const result = await forgotPassword(req.body)
    return res.json(result)
}

const resetPasswordController = async (req, res, next) => {
    const result = await resetPassword(req.body)
    return res.json(result)
}

const changePasswordController = async (req, res, next) => {
    const result = await changePassword(req.body)
    return res.json(result)
}

module.exports = {
    loginController,
    signupController,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController
}