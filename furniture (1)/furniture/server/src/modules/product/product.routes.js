const express = require('express')
const router = express.Router()
const productController = require('./product.controller')


router.post('/product', productController.addproduct)
router.get('/product', productController.getproduct)
router.put('/product', productController.updateProduct)
router.delete('/product/:id', productController.deleteProduct)

module.exports = router