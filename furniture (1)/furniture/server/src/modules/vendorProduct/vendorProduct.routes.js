const express = require('express')
const validate = require('../../middleware/validate')
const vendorProductSchemas = require('./vendorProduct.validation')
const vendorProductController = require('./vendorProduct.controller')
const { vendorOrAdmin } = require('../../middleware/auth')

const router = express.Router()

router.get('/', vendorProductController.list)
router.post('/', ...vendorOrAdmin, validate(vendorProductSchemas.create), vendorProductController.create)

module.exports = router
