const mongoose = require('mongoose')

const subcategorySchema = new mongoose.Schema(
    {
        subcategoryName: { type: String, required: true, trim: true },
        categoryDetail: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Subcategory', subcategorySchema)
