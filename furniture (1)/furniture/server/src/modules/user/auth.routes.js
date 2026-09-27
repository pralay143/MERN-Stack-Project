const express = require('express')
const userController = require('./user.controller')

// Registration and login. Password hashing and tokens are added in the
// security phase; for now these reuse the user controller.
const router = express.Router()

router.post('/register', userController.create)
router.post('/login', userController.login)

module.exports = router
