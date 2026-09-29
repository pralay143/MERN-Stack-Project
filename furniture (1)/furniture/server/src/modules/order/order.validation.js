const { z, objectId } = require('../../utils/validators')
const { ORDER_STATUSES } = require('./order.model')

// POST /orders: place the cart as an order to this (own) address.
const place = z.object({ addressId: objectId('Address') })

// POST /orders/:id/verify: what Razorpay Checkout's handler receives.
const verify = z
    .object({
        razorpay_order_id: z.string('Missing razorpay_order_id').min(1, 'Missing razorpay_order_id').max(100),
        razorpay_payment_id: z.string('Missing razorpay_payment_id').min(1, 'Missing razorpay_payment_id').max(100),
        razorpay_signature: z.string('Missing razorpay_signature').min(1, 'Missing razorpay_signature').max(200),
    })
    .transform((v) => ({ razorpayOrderId: v.razorpay_order_id, razorpayPaymentId: v.razorpay_payment_id, signature: v.razorpay_signature }))

// PATCH /orders/:id/items/:productId: move an item on (shipped, then delivered).
const itemStatus = z.object({ status: z.enum(['shipped', 'delivered'], 'Status must be shipped or delivered') })

// GET /orders/sold?status=&page=&limit=
const soldQuery = z.object({
    status: z.preprocess((v) => (v === '' ? undefined : v), z.enum(ORDER_STATUSES, 'Unknown status').optional()),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
})

module.exports = { place, verify, itemStatus, soldQuery }
