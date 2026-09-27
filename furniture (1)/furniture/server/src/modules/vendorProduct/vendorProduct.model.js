const mongoose = require('mongoose')

// A vendor's stock of a product.
const vendorProductSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', index: true },
        quantity: { type: Number, min: 0, default: 0 },
    },
    { timestamps: true }
)

module.exports = mongoose.model('VendorProduct', vendorProductSchema)
