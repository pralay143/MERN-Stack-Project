const fs = require('fs')
const mongoose = require('mongoose')
const multer = require('multer')
const ApiError = require('../utils/ApiError')

// Converts any error into a JSON response with a sensible status code.
// Unexpected errors are logged and reported as a generic 500, so internal
// details never reach the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    // A request that fails after its upload was saved must not leave the file behind.
    if (req.file?.path) fs.unlink(req.file.path, () => {})

    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message, ...(err.details && { errors: err.details }) })
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]))
        return res.status(400).json({ message: 'Validation failed', errors })
    }

    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: `Invalid value for ${err.path}` })
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field'
        return res.status(409).json({ message: `A record with this ${field} already exists` })
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message })
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body is not valid JSON' })
    }

    console.error(err)
    res.status(500).json({ message: 'Something went wrong' })
}

module.exports = errorHandler
