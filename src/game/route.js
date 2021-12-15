const express = require('express')
const authMiddleware = require('../auth/middleware')
const {gameCreateController, gameDetailController, gameEditController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/create', gameCreateController)
router.post('/edit/:id', gameEditController)
router.get('/detail/:id', gameDetailController)
module.exports = router