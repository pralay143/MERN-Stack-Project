const express = require('express')
const cityController = require('./city.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', cityController.list)
router.post('/', ...adminOnly, cityController.create)

module.exports = router
