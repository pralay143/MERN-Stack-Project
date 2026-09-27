const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        address: { type: String, required: true, trim: true },
        stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
        cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
        pincode: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Address', addressSchema)
