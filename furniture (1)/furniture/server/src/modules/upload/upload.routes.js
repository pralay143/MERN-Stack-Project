const express = require('express')
const uploadController = require('./upload.controller')
const { vendorOrAdmin } = require('../../middleware/auth')
const { uploadFile } = require('../../middleware/upload')

const router = express.Router()

router.post('/', ...vendorOrAdmin, uploadFile, uploadController.create)

module.exports = router
