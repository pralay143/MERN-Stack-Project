const express = require('express')
const uploadController = require('./upload.controller')
const { uploadFile } = require('../../middleware/upload')

const router = express.Router()

router.post('/Upload', uploadFile, uploadController.create)

module.exports = router
