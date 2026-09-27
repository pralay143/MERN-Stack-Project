const express = require('express')
const roleController = require('./role.controller')

const router = express.Router()

router.get('/', roleController.list)
router.post('/', roleController.create)

module.exports = router
