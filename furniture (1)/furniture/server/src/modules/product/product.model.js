const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')

const productSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: paiseField({ required: true }),
        // Units available to sell. Orders reduce it (and cancellations restore it).
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
            validate: { validator: Number.isInteger, message: 'Stock must be a whole number' },
        },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        file: {
            name: String,
            size: Number,
            url: String,
            type: { type: String },
        },
    },
    { timestamps: true }
)

// For the shop's sort orders.
productSchema.index({ createdAt: -1 })
productSchema.index({ price: 1 })

module.exports = mongoose.model('Product', productSchema)
