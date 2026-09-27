const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema(
    {
        vendorName: { type: String, required: true, trim: true },
        address: { type: String, trim: true },
        stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
        cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        pincode: { type: String, trim: true },
        contactNum: { type: String, trim: true },
        customerSupportNumber: { type: String, trim: true },
        feedbackEmail: { type: String, lowercase: true, trim: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Vendor', vendorSchema)
