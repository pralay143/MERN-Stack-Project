const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const uploadService = require('./upload.service')

// Expects the multipart form parsed by the uploadImage middleware.
const create = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No image selected (form field "file")')

    const record = await uploadService.create({
        name: req.file.originalname,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`, // public URL, not the path on disk
        type: req.file.mimetype,
    })
    res.status(201).json({ message: 'File uploaded', data: record })
})

module.exports = { create }
