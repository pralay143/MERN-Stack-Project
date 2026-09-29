// Razorpay webhook: Razorpay calls this directly when a payment is captured,
// so an order is marked paid even if the customer closed the tab before the
// browser could confirm. Setup (once the API has a public URL): Razorpay
// dashboard > Account & Settings > Webhooks > Add, URL
// https://<api host>/api/v1/payments/razorpay/webhook, events payment.captured
// and order.paid, and the same secret as RAZORPAY_WEBHOOK_SECRET.
const express = require('express')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const config = require('../../config/env')
const razorpay = require('../../services/razorpay')
const Order = require('../order/order.model')
const { markPaid } = require('../order/order.service')

const WEBHOOK_PATH = '/razorpay/webhook'
const PAID_EVENTS = new Set(['payment.captured', 'order.paid'])

const router = express.Router()

router.post(
    WEBHOOK_PATH,
    asyncHandler(async (req, res) => {
        if (!config.razorpayWebhookSecret) throw new ApiError(503, 'The Razorpay webhook isn’t set up on this server')
        // The signature covers the exact bytes Razorpay sent (captured by express.json in app.js).
        if (!razorpay.verifyWebhookSignature(req.rawBody, req.get('x-razorpay-signature'))) {
            throw ApiError.badRequest('Invalid webhook signature')
        }

        const { event, payload } = req.body
        const payment = payload?.payment?.entity
        if (!PAID_EVENTS.has(event) || !payment?.order_id) return res.json({ received: true, handled: false })

        const order = await Order.findOne({ 'payment.razorpayOrderId': payment.order_id })
        if (!order) return res.json({ received: true, handled: false })
        if (payment.amount !== order.total || payment.currency !== 'INR') {
            console.error(`Razorpay webhook: amount ${payment.amount} ${payment.currency} doesn't match order ${order.orderNumber} (${order.total} INR)`)
            return res.json({ received: true, handled: false })
        }

        try {
            await markPaid(order._id, payment.id, 'Payment confirmed by Razorpay')
        } catch (err) {
            // e.g. paid after the order expired and sold out: flagged for refund.
            // Acknowledge anyway so Razorpay doesn't keep retrying.
            console.error(`Razorpay webhook for ${order.orderNumber}: ${err.message}`)
            return res.json({ received: true, handled: false })
        }
        res.json({ received: true, handled: true })
    })
)

module.exports = router
module.exports.WEBHOOK_PATH = WEBHOOK_PATH
