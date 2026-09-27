const express = require('express')
const categoryController = require('./category.controller')

const router = express.Router()

router.get('/category', categoryController.list)
router.post('/category', categoryController.create)
router.put('/category', categoryController.update)
router.delete('/category/:id', categoryController.remove)

module.exports = router
