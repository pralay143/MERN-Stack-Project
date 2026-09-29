const { z, objectId } = require('../../utils/validators')

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

module.exports = { place, verify }
