const express = require('express')
const validate = require('../../middleware/validate')
const orderSchemas = require('./order.validation')
const orderController = require('./order.controller')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

// A customer's own orders. Every route acts on the caller's orders only.
router.post('/', requireAuth, validate(orderSchemas.place), orderController.place)
router.get('/', requireAuth, orderController.listMine)
router.get('/:id', requireAuth, orderController.getMine)
router.post('/:id/pay', requireAuth, orderController.retryPayment)
router.post('/:id/verify', requireAuth, validate(orderSchemas.verify), orderController.verify)
router.post('/:id/cancel', requireAuth, orderController.cancel)

module.exports = router
