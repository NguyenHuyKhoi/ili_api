const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController, deleteController, editController, detailController, getLibraryController, searchController } = require('./controller')
const router = express.Router()

router.use(authMiddleware.isAuth)

router.post('/', createController)
router.get('/library', getLibraryController)
router.delete('/:id', deleteController)
router.put('/:id', editController)
router.get('/search', searchController)
router.get('/:id', detailController)
module.exports = router