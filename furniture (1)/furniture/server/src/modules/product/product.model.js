const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')

const productSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        price: paiseField({ required: true }),
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        file: {
            name: String,
            size: Number,
            url: String,
            type: { type: String },
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
