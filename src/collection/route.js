const express = require('express')
const authMiddleware = require('../auth/middleware')
const {collectionCreateController, collectionDetailController, collectionEditController, collectionDeleteController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/create', collectionCreateController)
router.post('/edit/:id', collectionEditController)
router.get('/detail/:id', collectionDetailController)
router.delete('/delete/:id', collectionDeleteController)


module.exports = router