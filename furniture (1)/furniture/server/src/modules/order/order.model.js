const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
        total: paiseField({ required: true }),
        statusId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderStatus' },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
