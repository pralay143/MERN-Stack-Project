const express = require('express')
const roleController = require('./role.controller')

const router = express.Router()

router.get('/role', roleController.list)
router.post('/role', roleController.create)

module.exports = router
