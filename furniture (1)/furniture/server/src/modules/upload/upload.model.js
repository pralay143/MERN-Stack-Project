const mongoose = require('mongoose')

const fileUploadSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        size: Number,
        url: String,
        type: { type: String },
    },
    { timestamps: true }
)

module.exports = mongoose.model('FileUpload', fileUploadSchema)
