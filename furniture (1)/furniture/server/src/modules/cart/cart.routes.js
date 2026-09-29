const express = require('express')
const validate = require('../../middleware/validate')
const cartSchemas = require('./cart.validation')
const cartController = require('./cart.controller')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

// Any logged-in user has a cart; each route acts on the caller's own.
router.get('/', requireAuth, cartController.get)
router.delete('/', requireAuth, cartController.clear)
router.post('/merge', requireAuth, validate(cartSchemas.merge), cartController.merge)
router.put('/items/:productId', requireAuth, validate(cartSchemas.setQuantity), cartController.setQuantity)
router.delete('/items/:productId', requireAuth, cartController.removeItem)

module.exports = router
