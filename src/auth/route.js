const express = require('express')
const { loginController, signupController, requestResetPasswordController, resetPasswordController, changePasswordController } = require('./controller')
const router = express.Router()

router.post('/login', loginController)
router.post('/register', signupController)
router.post('/forgot-password', requestResetPasswordController)
router.post('/reset-password', resetPasswordController)
router.post('/change-password', changePasswordController)
module.exports = router