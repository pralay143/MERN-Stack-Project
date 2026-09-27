const express = require('express')
const validate = require('../../middleware/validate')
const categorySchemas = require('./category.validation')
const categoryController = require('./category.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', categoryController.list)
router.post('/', ...adminOnly, validate(categorySchemas.create), categoryController.create)
router.get('/:id', categoryController.getById)
router.patch('/:id', ...adminOnly, validate(categorySchemas.update), categoryController.update)
router.delete('/:id', ...adminOnly, categoryController.remove)

module.exports = router
