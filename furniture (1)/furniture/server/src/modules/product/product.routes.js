const express = require('express')
const validate = require('../../middleware/validate')
const { validateQuery } = require('../../middleware/validate')
const productSchemas = require('./product.validation')
const productController = require('./product.controller')
const { vendorOrAdmin } = require('../../middleware/auth')
const { uploadImage } = require('../../middleware/upload')

const router = express.Router()

router.get('/', validateQuery(productSchemas.listQuery), productController.list)
// Auth runs before the upload, so anonymous requests never write files.
router.post('/', ...vendorOrAdmin, ...uploadImage, validate(productSchemas.create), productController.create)
router.get('/:id', productController.getById)
// Vendors may change only their own products; the controller checks this.
router.patch('/:id', ...vendorOrAdmin, validate(productSchemas.update), productController.update)
router.delete('/:id', ...vendorOrAdmin, productController.remove)

module.exports = router
