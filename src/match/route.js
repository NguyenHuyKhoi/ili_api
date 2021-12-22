const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController} = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/', createController)
module.exports = router