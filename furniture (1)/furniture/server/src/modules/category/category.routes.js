const express = require('express')
const categoryController = require('./category.controller')

const router = express.Router()

router.get('/', categoryController.list)
router.post('/', categoryController.create)
router.get('/:id', categoryController.getById)
router.patch('/:id', categoryController.update)
router.delete('/:id', categoryController.remove)

module.exports = router
