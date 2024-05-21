const express = require('express')
const router = express.Router()
const productController = require('../controller/productController')


router.post('/product', productController.addproduct)
router.get('/product', productController.getproduct)
router.put('/product', productController.updateProduct)
router.delete('/product/:id', productController.deleteProduct)

module.exports = router