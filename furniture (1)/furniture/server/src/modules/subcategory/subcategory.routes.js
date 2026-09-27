const express = require('express')
const subcategoryController = require('./subcategory.controller')

const router = express.Router()

router.get('/subcategory', subcategoryController.list)
router.post('/subcategory', subcategoryController.create)
router.put('/subcategory', subcategoryController.update)
router.delete('/subcategory/:id', subcategoryController.remove)

module.exports = router
