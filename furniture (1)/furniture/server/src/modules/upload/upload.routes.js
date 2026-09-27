const express = require('express')
const uploadController = require('./upload.controller')
const { vendorOrAdmin } = require('../../middleware/auth')
const { uploadImage } = require('../../middleware/upload')

const router = express.Router()

router.post('/', ...vendorOrAdmin, ...uploadImage, uploadController.create)

module.exports = router
