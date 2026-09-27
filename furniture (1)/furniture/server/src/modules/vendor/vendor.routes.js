const express = require('express')
const validate = require('../../middleware/validate')
const vendorSchemas = require('./vendor.validation')
const vendorController = require('./vendor.controller')
const { adminOnly, vendorOrAdmin } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, vendorController.list)
router.post('/', ...vendorOrAdmin, validate(vendorSchemas.create), vendorController.create)
// Vendors may read and update their own profile; the controller checks this.
router.get('/:id', ...vendorOrAdmin, vendorController.getById)
router.patch('/:id', ...vendorOrAdmin, validate(vendorSchemas.update), vendorController.update)
router.delete('/:id', ...adminOnly, vendorController.remove)

module.exports = router
