const express = require('express')
const productController = require('./product.controller')
const { uploadProductImage } = require('../../middleware/upload')

const router = express.Router()

router.post('/product', uploadProductImage, productController.create)
router.get('/product', productController.list)
router.put('/product', productController.update)
router.delete('/product/:id', productController.remove)

module.exports = router
