const express = require('express')
const authMiddleware = require('../auth/middleware')
const { editController, detailController, deleteController, getAllController, banController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.get('/all', getAllController)
router.put('/:id', editController)
router.get('/ban', banController)
router.get('/detail/:id', detailController)
router.delete('/:id', deleteController)
module.exports = router