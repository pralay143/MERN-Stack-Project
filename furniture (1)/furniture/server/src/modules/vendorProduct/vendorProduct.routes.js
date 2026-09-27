const express = require('express')
const vendorProductController = require('./vendorProduct.controller')

const router = express.Router()

router.get('/', vendorProductController.list)
router.post('/', vendorProductController.create)

module.exports = router
