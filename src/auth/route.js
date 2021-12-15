const express = require('express')
const { loginController, signupController, forgotPasswordController, resetPasswordController, changePasswordController } = require('./controller')
const router = express.Router()

router.post('/login', loginController)
router.post('/register', signupController)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.post('/change-password', changePasswordController)
module.exports = router