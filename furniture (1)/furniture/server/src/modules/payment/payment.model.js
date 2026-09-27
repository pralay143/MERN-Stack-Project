const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')

const paymentSchema = new mongoose.Schema(
    {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        status: { type: String },
        amount: paiseField({ required: true }),
        type: { type: String, required: true },
        transactionCode: { type: String, required: true },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Payment', paymentSchema)
