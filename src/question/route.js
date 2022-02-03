const express = require('express')
const authMiddleware = require('../auth/middleware')
const {searchController, createController} = require('./controller')
const router = express.Router()
router.use(authMiddleware.isAuth)


router.get('/search', searchController)
router.post('/create', createController)
module.exports = router