const express = require('express')
const vendorController = require('./vendor.controller')
const { adminOnly, vendorOrAdmin } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, vendorController.list)
router.post('/', ...vendorOrAdmin, vendorController.create)
// Vendors may read and update their own profile; the controller checks this.
router.get('/:id', ...vendorOrAdmin, vendorController.getById)
router.patch('/:id', ...vendorOrAdmin, vendorController.update)
router.delete('/:id', ...adminOnly, vendorController.remove)

module.exports = router
