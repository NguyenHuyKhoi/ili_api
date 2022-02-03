const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController, deleteController, editController, detailController, getLibraryController, searchController, cloneController, getDetailController, getAllController } = require('./controller')
const router = express.Router()

router.get('/search', searchController)
router.get('/detail/:id', getDetailController)
router.use(authMiddleware.isAuth)

router.post('/create', createController)
router.post('/edit/:id', editController)
router.post('/clone/:id', cloneController)

router.get('/library', getLibraryController)
router.get('/all', getAllController)
router.delete('/:id', deleteController)
module.exports = router