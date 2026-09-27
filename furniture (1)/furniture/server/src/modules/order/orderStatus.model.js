const mongoose = require('mongoose')

const orderStatusSchema = new mongoose.Schema(
    {
        status: { type: String, required: true, unique: true, trim: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('OrderStatus', orderStatusSchema)
