const express = require('express')
const stateController = require('./state.controller')
const { adminOnly } = require('../../middleware/auth')

const router = express.Router()

router.get('/', stateController.list)
router.post('/', ...adminOnly, stateController.create)

module.exports = router
