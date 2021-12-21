const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController, editController, detailController, deleteController, getLibraryController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/', createController)
router.put('/:id', editController)
router.get('/library/:userId', getLibraryController)
router.get('/:id', detailController)
router.delete('/:id', deleteController)


module.exports = router