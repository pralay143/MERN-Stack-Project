const express = require('express')
const cityController = require('./city.controller')

const router = express.Router()

router.get('/city', cityController.list)
router.post('/city', cityController.create)

module.exports = router
