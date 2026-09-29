const mongoose = require('mongoose')
const INDIAN_STATES = require('../../config/indianStates')

// A delivery address saved by a user.
const addressSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        fullName: { type: String, required: true, trim: true },
        // 10-digit Indian mobile number.
        phone: { type: String, required: true, trim: true },
        line1: { type: String, required: true, trim: true },
        line2: { type: String, trim: true },
        landmark: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, enum: INDIAN_STATES },
        pincode: { type: String, required: true, match: /^[1-9]\d{5}$/ },
        isDefault: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Address', addressSchema)
