const crypto = require('crypto')
const mongoose = require('mongoose')
const { paiseField } = require('../../utils/money')
const { MAX_QUANTITY_PER_ITEM } = require('../../config/shop')

// pending_payment: created, stock reserved, waiting for Razorpay
// processing:      paid; items are being prepared by their sellers
// shipped:         every item has shipped
// delivered:       every item has been delivered
// cancelled:       unpaid and abandoned/cancelled, or cancelled by an admin
const ORDER_STATUSES = ['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled']

// Each seller ships their own items, so fulfilment is tracked per item.
const ITEM_STATUSES = ['processing', 'shipped', 'delivered']

const { Schema } = mongoose

// What was bought, copied at order time so later product edits (price,
// name, photo) never change a past order.
const orderItemSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'User' },
        productName: { type: String, required: true },
        imageUrl: String,
        unitPrice: paiseField({ required: true }),
        quantity: { type: Number, required: true, min: 1, max: MAX_QUANTITY_PER_ITEM },
        lineTotal: paiseField({ required: true }),
        status: { type: String, enum: ITEM_STATUSES, default: 'processing' },
        shippedAt: Date,
        deliveredAt: Date,
    },
    { _id: false }
)

// The delivery address as it was when the order was placed.
const addressSnapshotSchema = new Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        line1: { type: String, required: true },
        line2: String,
        landmark: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    { _id: false }
)

const orderSchema = new Schema(
    {
        // Shown to customers, e.g. EF-260929-7K3QX2.
        orderNumber: { type: String, required: true, unique: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        items: {
            type: [orderItemSchema],
            validate: { validator: (items) => items.length > 0, message: 'An order needs at least one item' },
        },
        subtotal: paiseField({ required: true }),
        deliveryFee: paiseField({ required: true }),
        total: paiseField({ required: true }),
        address: { type: addressSnapshotSchema, required: true },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending_payment' },
        statusHistory: [{ _id: false, status: String, at: { type: Date, default: Date.now }, note: String }],
        payment: {
            razorpayOrderId: String,
            razorpayPaymentId: String,
            paidAt: Date,
        },
        // True once reserved stock has been put back (so it's never done twice).
        stockReleased: { type: Boolean, default: false },
        cancelledAt: Date,
        cancelReason: String,
    },
    { timestamps: true }
)

orderSchema.index({ 'payment.razorpayOrderId': 1 }, { unique: true, sparse: true })
// Finding unpaid orders to expire, and a seller's orders.
orderSchema.index({ status: 1, createdAt: 1 })
orderSchema.index({ 'items.seller': 1, createdAt: -1 })

// Records a status change with an optional note.
orderSchema.methods.setStatus = function (status, note) {
    this.status = status
    this.statusHistory.push({ status, at: new Date(), note })
}

// EF-<yymmdd>-<6 random letters/digits>, avoiding look-alikes (0/O, 1/I).
// The date is India's (IST), matching what customers see on the order.
const istDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function newOrderNumber(date = new Date()) {
    const ymd = istDate.format(date).slice(2).replace(/-/g, '')
    const random = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('')
    return `EF-${ymd}-${random}`
}

module.exports = mongoose.model('Order', orderSchema)
module.exports.ORDER_STATUSES = ORDER_STATUSES
module.exports.ITEM_STATUSES = ITEM_STATUSES
module.exports.newOrderNumber = newOrderNumber
