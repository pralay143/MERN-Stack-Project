const express = require('express')
const stateController = require('./state.controller')

const router = express.Router()

router.post('/state', stateController.create)
router.get('/state', stateController.list)

module.exports = router
