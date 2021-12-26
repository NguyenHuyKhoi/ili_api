const express = require('express')
const authMiddleware = require('../auth/middleware')
const {getLibraryController} = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)
router.get('/library', getLibraryController)

module.exports = router