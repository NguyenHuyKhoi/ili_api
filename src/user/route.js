const express = require('express')
const authMiddleware = require('../auth/middleware')
const { profileEditController, profileDetailController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/edit', profileEditController)
router.get('/detail/:id', profileDetailController)
module.exports = router