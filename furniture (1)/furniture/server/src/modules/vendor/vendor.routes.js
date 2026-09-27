const express = require('express')
const vendorController = require('./vendor.controller')

const router = express.Router()

router.get('/', vendorController.list)
router.post('/', vendorController.create)
router.get('/:id', vendorController.getById)
router.patch('/:id', vendorController.update)
router.delete('/:id', vendorController.remove)

module.exports = router
