const express = require('express')
const validate = require('../../middleware/validate')
const locationSchemas = require('./location.validation')
const cityController = require('./city.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', cityController.list)
router.post('/', ...adminOnly, validate(locationSchemas.createCity), cityController.create)

module.exports = router
