const express = require('express')
const validate = require('../../middleware/validate')
const roleSchemas = require('./role.validation')
const roleController = require('./role.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', ...adminOnly, roleController.list)
router.post('/', ...adminOnly, validate(roleSchemas.create), roleController.create)

module.exports = router
