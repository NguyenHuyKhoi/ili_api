const express = require('express')
const { route } = require('express/lib/application')
const authMiddleware = require('./middleware')
const { loginController, signupController, requestResetPasswordController, resetPasswordController, changePasswordController } = require('./controller')
const router = express.Router()

router.post('/login', loginController)
router.post('/register', signupController)
router.post('/forgot-password', requestResetPasswordController)

router.use(authMiddleware.isAuth)

router.post('/reset-password', resetPasswordController)
router.post('/change-password', changePasswordController)
module.exports = router