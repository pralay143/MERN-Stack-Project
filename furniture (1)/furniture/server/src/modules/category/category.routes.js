const express = require('express')
const categoryController = require('./category.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', categoryController.list)
router.post('/', ...adminOnly, categoryController.create)
router.get('/:id', categoryController.getById)
router.patch('/:id', ...adminOnly, categoryController.update)
router.delete('/:id', ...adminOnly, categoryController.remove)

module.exports = router
