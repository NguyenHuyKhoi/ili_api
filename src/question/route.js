const express = require('express')
const authMiddleware = require('../auth/middleware')
const {searchController, createController, deleteController, editController} = require('./controller')
const router = express.Router()
router.use(authMiddleware.isAuth)


router.get('/search', searchController)
router.post('/create', createController)
router.post('/edit/:id', editController)
router.delete('/:id', deleteController)
module.exports = router