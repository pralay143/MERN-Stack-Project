const express = require('express')
const validate = require('../../middleware/validate')
const authSchemas = require('./auth.validation')
const authController = require('./auth.controller')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

router.post('/register', validate(authSchemas.register), authController.register)
router.post('/login', validate(authSchemas.login), authController.login)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

module.exports = router
