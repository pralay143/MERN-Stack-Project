const express = require('express')
const subcategoryController = require('./subcategory.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', subcategoryController.list)
router.post('/', ...adminOnly, subcategoryController.create)
router.get('/:id', subcategoryController.getById)
router.patch('/:id', ...adminOnly, subcategoryController.update)
router.delete('/:id', ...adminOnly, subcategoryController.remove)

module.exports = router
