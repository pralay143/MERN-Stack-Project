const express = require('express')
const productController = require('./product.controller')
const { uploadProductImage } = require('../../middleware/upload')

const router = express.Router()

router.get('/', productController.list)
router.post('/', uploadProductImage, productController.create)
router.get('/:id', productController.getById)
router.patch('/:id', productController.update)
router.delete('/:id', productController.remove)

module.exports = router
