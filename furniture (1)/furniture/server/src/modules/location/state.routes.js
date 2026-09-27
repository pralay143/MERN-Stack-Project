const express = require('express')
const validate = require('../../middleware/validate')
const locationSchemas = require('./location.validation')
const stateController = require('./state.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', stateController.list)
router.post('/', ...adminOnly, validate(locationSchemas.createState), stateController.create)

module.exports = router
