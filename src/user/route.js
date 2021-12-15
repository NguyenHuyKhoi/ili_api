const express = require('express')
const authMiddleware = require('../auth/middleware')
const { profileEditController, profileViewController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/profile/edit', profileEditController)
router.get('/profile/view/:id', profileViewController)
module.exports = router