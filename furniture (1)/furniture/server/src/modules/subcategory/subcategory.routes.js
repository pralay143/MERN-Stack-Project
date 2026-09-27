const express = require('express')
const validate = require('../../middleware/validate')
const subcategorySchemas = require('./subcategory.validation')
const subcategoryController = require('./subcategory.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', subcategoryController.list)
router.post('/', ...adminOnly, validate(subcategorySchemas.create), subcategoryController.create)
router.get('/:id', subcategoryController.getById)
router.patch('/:id', ...adminOnly, validate(subcategorySchemas.update), subcategoryController.update)
router.delete('/:id', ...adminOnly, subcategoryController.remove)

module.exports = router
