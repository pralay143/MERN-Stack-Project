const express = require('express')
const stateController = require('./state.controller')

const router = express.Router()

router.get('/', stateController.list)
router.post('/', stateController.create)

module.exports = router
