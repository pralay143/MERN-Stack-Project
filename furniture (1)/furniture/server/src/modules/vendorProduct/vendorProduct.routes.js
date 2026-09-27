const express = require('express')
const vendorProductController = require('./vendorProduct.controller')
const { vendorOrAdmin } = require('../../middleware/auth')

const router = express.Router()

router.get('/', vendorProductController.list)
router.post('/', ...vendorOrAdmin, vendorProductController.create)

module.exports = router
