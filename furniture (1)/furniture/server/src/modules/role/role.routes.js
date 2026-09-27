const express = require('express')
const roleController = require('./role.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, roleController.list)
router.post('/', ...adminOnly, roleController.create)

module.exports = router
