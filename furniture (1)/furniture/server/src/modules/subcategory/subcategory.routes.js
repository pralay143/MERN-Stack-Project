const express = require('express')
const subcategoryController = require('./subcategory.controller')

const router = express.Router()

router.get('/', subcategoryController.list)
router.post('/', subcategoryController.create)
router.get('/:id', subcategoryController.getById)
router.patch('/:id', subcategoryController.update)
router.delete('/:id', subcategoryController.remove)

module.exports = router
