const express = require('express')
const authMiddleware = require('../auth/middleware')
const {createController, editController, detailController, deleteController, getLibraryController, searchController, getAllController, adminHideController } = require('./controller')
const router = express.Router()

router.get('/search', searchController)
router.use(authMiddleware.isAuth)

router.post('/', createController)
router.put('/:id', editController)
router.get('/library', getLibraryController)
router.get('/all', getAllController)
router.get('/hide', adminHideController)
router.get('/detail/:id', detailController)
router.delete('/:id', deleteController)

module.exports = router