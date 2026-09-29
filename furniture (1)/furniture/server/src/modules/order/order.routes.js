const express = require('express')
const validate = require('../../middleware/validate')
const orderSchemas = require('./order.validation')
const orderController = require('./order.controller')
const { validateQuery } = require('../../middleware/validate')
const { requireAuth, vendorOrAdmin } = require('../../middleware/auth')

const router = express.Router()

// A customer's own orders (placing, paying, cancelling unpaid ones).
router.post('/', requireAuth, validate(orderSchemas.place), orderController.place)
router.get('/', requireAuth, orderController.listMine)
// Sellers and admins (before /:id so 'sold' isn't read as an id).
router.get('/sold', ...vendorOrAdmin, validateQuery(orderSchemas.soldQuery), orderController.listSold)
router.patch('/:id/items/:productId', ...vendorOrAdmin, validate(orderSchemas.itemStatus), orderController.updateItemStatus)

router.get('/:id', requireAuth, orderController.get)
router.post('/:id/pay', requireAuth, orderController.retryPayment)
router.post('/:id/verify', requireAuth, validate(orderSchemas.verify), orderController.verify)
router.post('/:id/cancel', requireAuth, orderController.cancel)

module.exports = router
