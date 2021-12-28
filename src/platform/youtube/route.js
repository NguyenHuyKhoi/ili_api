const express = require('express')
const { OAuthCallbackController, OAuthRequestController } = require('./controller')
const router = express.Router()

router.get('/auth/request', OAuthRequestController)
router.get('/auth/callback', OAuthCallbackController)
module.exports = router