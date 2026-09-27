const express = require('express')
const vendorController = require('./vendor.controller')

const router = express.Router()

router.post('/vendor', vendorController.create)
router.get('/vendor', vendorController.list)
router.put('/vendor', vendorController.update)
router.get('/vendor/:id', vendorController.getById)
router.delete('/vendor/:id', vendorController.remove)

module.exports = router
