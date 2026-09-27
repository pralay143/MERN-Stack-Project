const mongoose = require('mongoose')

const vendorProductImageSchema = new mongoose.Schema(
    {
        vendorProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProduct', index: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('VendorProductImage', vendorProductImageSchema)
