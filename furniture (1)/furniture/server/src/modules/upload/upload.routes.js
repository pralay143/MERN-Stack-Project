const express = require('express')
const uploadController = require('./upload.controller')
const { uploadFile } = require('../../middleware/upload')

const router = express.Router()

router.post('/', uploadFile, uploadController.create)

module.exports = router
