const express = require('express')
const vendorProductController = require('./vendorProduct.controller')

const router = express.Router()

router.get('/get', vendorProductController.list)
router.post('/add', vendorProductController.create)

module.exports = router
