const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')

// One line of an order.
const orderDetailSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        vendorProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProduct' },
        quantity: { type: Number, required: true, min: 1 },
        price: paiseField({ required: true }),
    },
    { timestamps: true }
)

module.exports = mongoose.model('OrderDetail', orderDetailSchema)
