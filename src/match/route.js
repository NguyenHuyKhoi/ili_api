const express = require('express')
const authMiddleware = require('../auth/middleware')
const {getLibraryController,createLivestreamController, completeLivestreamController, startLivestreamController, getDetailController} = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)
router.get('/library', getLibraryController)
router.get('/detail/:id', getDetailController)
router.post('/livestream/create', createLivestreamController)
router.post('/livestream/start', startLivestreamController)
router.post('/livestream/complete', completeLivestreamController)
module.exports = router