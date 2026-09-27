const express = require('express')
const userController = require('./user.controller')

const router = express.Router()

router.get('/user', userController.list)
router.post('/user', userController.create)
router.put('/user', userController.update)
router.get('/user/:id', userController.getById)
router.delete('/user/:id', userController.remove)
router.post('/user/login', userController.login)

module.exports = router
