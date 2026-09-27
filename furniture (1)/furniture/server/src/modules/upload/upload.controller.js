const path = require('path')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const { uploadDir } = require('../../config/env')
const uploadService = require('./upload.service')

// Expects the multipart form parsed by the uploadFile middleware.
const create = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file selected (form field "file")')

    const record = await uploadService.create({
        name: req.file.originalname,
        size: req.file.size,
        url: path.join(uploadDir, req.file.filename),
        type: req.file.mimetype,
    })
    res.status(201).json({ message: 'File uploaded', data: record })
})

module.exports = { create }
