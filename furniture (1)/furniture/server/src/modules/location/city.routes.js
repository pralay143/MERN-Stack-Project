const express = require('express')
const cityController = require('./city.controller')

const router = express.Router()

router.get('/', cityController.list)
router.post('/', cityController.create)

module.exports = router
