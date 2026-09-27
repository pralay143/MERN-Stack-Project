const express = require('express')
const userController = require('./user.controller')

const router = express.Router()

router.get('/', userController.list)
router.post('/', userController.create)
router.get('/:id', userController.getById)
router.patch('/:id', userController.update)
router.delete('/:id', userController.remove)

module.exports = router
