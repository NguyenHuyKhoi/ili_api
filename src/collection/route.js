const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController, editController, detailController, deleteController, getLibraryController, searchController } = require('./controller')
const router = express.Router()

router.get('/search', searchController)
router.use(authMiddleware.isAuth)

router.post('/', createController)
router.put('/:id', editController)
router.get('/library', getLibraryController)
router.get('/:id', detailController)
router.delete('/:id', deleteController)


module.exports = router