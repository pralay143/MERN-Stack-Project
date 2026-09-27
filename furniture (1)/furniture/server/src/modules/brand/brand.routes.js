const express = require('express')
const brandController = require('./brand.controller')

const router = express.Router()

router.get('/brand', brandController.list)
router.post('/brand', brandController.create)
router.put('/brand', brandController.update)
router.delete('/brand/:id', brandController.remove)

module.exports = router
