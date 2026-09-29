const express = require('express')
const validate = require('../../middleware/validate')
const addressSchemas = require('./address.validation')
const addressController = require('./address.controller')
const { requireAuth } = require('../../middleware/auth')

const router = express.Router()

// A user's own delivery addresses.
router.get('/', requireAuth, addressController.list)
router.post('/', requireAuth, validate(addressSchemas.create), addressController.create)
router.patch('/:id', requireAuth, validate(addressSchemas.update), addressController.update)
router.delete('/:id', requireAuth, addressController.remove)

module.exports = router
