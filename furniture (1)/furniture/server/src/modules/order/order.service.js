const Order = require('./order.model')
const Cart = require('../cart/cart.model')
const Product = require('../product/product.model')
const checkoutService = require('../checkout/checkout.service')
const razorpay = require('../../services/razorpay')
const ApiError = require('../../utils/ApiError')
const config = require('../../config/env')

// ---- Stock ----------------------------------------------------------------

// Takes each item's quantity out of stock, only if enough is left (a
// conditional update, so two buyers can't both get the last one). If any
// item can't be reserved, the ones already taken are put back.
async function reserveStock(items) {
    const taken = []
    for (const item of items) {
        const { modifiedCount } = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
        )
        if (modifiedCount === 0) {
            await Promise.all(taken.map((t) => Product.updateOne({ _id: t.product }, { $inc: { stock: t.quantity } })))
            throw ApiError.conflict(`${item.productName} has just sold out or has fewer left. Please check your cart.`)
        }
        taken.push(item)
    }
}

// Puts an order's stock back, once: the flag is flipped atomically first.
async function releaseStock(orderId) {
    const order = await Order.findOneAndUpdate({ _id: orderId, stockReleased: false }, { stockReleased: true })
    if (!order) return
    await Promise.all(order.items.map((item) => Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })))
}

// ---- Status changes ---------------------------------------------------------

const historyEntry = (status, note) => ({ status, at: new Date(), note })

// Moves an order from one status to another only if it's still in `from`
// (so concurrent requests can't both succeed). Returns the updated order or null.
function transition(filter, from, to, { note, set = {} } = {}) {
    return Order.findOneAndUpdate(
        { ...filter, status: from },
        { $set: { status: to, ...set }, $push: { statusHistory: historyEntry(to, note) } },
        { new: true }
    )
}

// Removes the ordered products from the buyer's cart once they've paid.
const clearOrderedFromCart = (order) =>
    Cart.updateOne({ user: order.user }, { $pull: { items: { product: { $in: order.items.map((i) => i.product) } } } })

// Records a successful payment. Safe to call twice for the same payment (the
// browser and the webhook may both report it).
async function markPaid(orderId, paymentId, note) {
    const paidAt = new Date()
    const paid = await transition({ _id: orderId }, 'pending_payment', 'processing', {
        note,
        set: { 'payment.razorpayPaymentId': paymentId, 'payment.paidAt': paidAt },
    })
    if (paid) {
        await clearOrderedFromCart(paid)
        return paid
    }

    const order = await Order.findById(orderId)
    if (!order) throw ApiError.notFound('Order not found')
    if (order.payment.razorpayPaymentId === paymentId && order.status !== 'cancelled') return order

    // Paid after the order had expired or been cancelled: take the stock again
    // if it's still there, otherwise flag it for a refund.
    if (order.status === 'cancelled' && !order.payment.razorpayPaymentId) {
        order.payment.razorpayPaymentId = paymentId
        order.payment.paidAt = paidAt
        try {
            await reserveStock(order.items)
        } catch {
            order.cancelReason = 'Payment arrived after the order was cancelled and the items had sold out: refund required'
            order.statusHistory.push(historyEntry('cancelled', order.cancelReason))
            await order.save()
            throw ApiError.conflict(
                'Your payment arrived after the order had expired and the items have sold out. The payment will be refunded.'
            )
        }
        order.stockReleased = false
        order.cancelledAt = undefined
        order.cancelReason = undefined
        order.setStatus('processing', `${note} (after the order had been cancelled)`)
        await order.save()
        await clearOrderedFromCart(order)
        return order
    }
    throw ApiError.conflict('This order is no longer waiting for payment')
}

// Cancels unpaid orders older than the payment window and releases their stock.
async function expireUnpaid(now = new Date()) {
    const cutoff = new Date(now.getTime() - config.unpaidOrderMinutes * 60_000)
    const stale = await Order.find({ status: 'pending_payment', createdAt: { $lt: cutoff } }).select('_id')
    for (const { _id } of stale) {
        const cancelled = await transition({ _id }, 'pending_payment', 'cancelled', {
            note: 'Payment not completed in time',
            set: { cancelledAt: now, cancelReason: 'Payment not completed in time' },
        })
        if (cancelled) await releaseStock(_id)
    }
    return stale.length
}

// ---- Placing and paying -------------------------------------------------------

// What the browser needs to open Razorpay Checkout for an order.
const paymentOptions = (order, user) => ({
    keyId: config.razorpayKeyId,
    razorpayOrderId: order.payment.razorpayOrderId,
    amount: order.total,
    currency: 'INR',
    name: 'E-Furniture',
    description: `Order ${order.orderNumber}`,
    prefill: { name: order.address.fullName || user.name, email: user.email, contact: order.address.phone },
})

function requirePayments() {
    if (!razorpay.isConfigured()) throw new ApiError(503, 'Online payment isn’t set up on this server yet')
}

// Places an order from the user's cart: the same summary as checkout (so the
// total shown is the total charged), stock reserved, then a Razorpay order
// for the total. Returns the order and the options for Razorpay Checkout.
async function place(user, addressId) {
    requirePayments()
    await expireUnpaid()

    const summary = await checkoutService.summary(user._id, addressId)
    if (!summary.canPlaceOrder) throw ApiError.badRequest(summary.blockers.join('. '), { blockers: summary.blockers })

    const { address } = summary
    const items = summary.items.map(({ product, quantity, lineTotal }) => ({
        product: product._id,
        seller: product.user,
        productName: product.productName,
        imageUrl: product.file?.url,
        unitPrice: product.price,
        quantity,
        lineTotal,
    }))

    await reserveStock(items)
    const order = await Order.create({
        orderNumber: Order.newOrderNumber(),
        user: user._id,
        items,
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        total: summary.total,
        address: {
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
        },
        statusHistory: [historyEntry('pending_payment', 'Order placed')],
    })

    try {
        const rzp = await razorpay.createOrder({
            amount: order.total,
            receipt: order.orderNumber,
            notes: { orderId: order._id.toString(), orderNumber: order.orderNumber },
        })
        order.payment.razorpayOrderId = rzp.id
        await order.save()
    } catch (err) {
        await releaseStock(order._id)
        await Order.deleteOne({ _id: order._id })
        console.error(err)
        throw new ApiError(502, 'We couldn’t start the payment. Please try again in a moment.')
    }
    return { order, payment: paymentOptions(order, user) }
}

// The payment options again, for paying an unpaid order later.
async function retryPayment(user, orderId) {
    requirePayments()
    await expireUnpaid()
    const order = await Order.findOne({ _id: orderId, user: user._id })
    if (!order) throw ApiError.notFound('Order not found')
    if (order.status !== 'pending_payment') {
        throw ApiError.conflict(
            order.status === 'cancelled' ? 'This order was cancelled. Please place a new order.' : 'This order has already been paid'
        )
    }
    return { order, payment: paymentOptions(order, user) }
}

// Checks Razorpay's signature from the browser and records the payment.
async function verifyPayment(user, orderId, { razorpayOrderId, razorpayPaymentId, signature }) {
    const order = await Order.findOne({ _id: orderId, user: user._id })
    if (!order) throw ApiError.notFound('Order not found')
    if (!order.payment.razorpayOrderId || order.payment.razorpayOrderId !== razorpayOrderId) {
        throw ApiError.badRequest('This payment doesn’t belong to this order')
    }
    if (!razorpay.verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
        throw ApiError.badRequest('We couldn’t verify this payment. If money was taken, it will be refunded.')
    }
    return markPaid(order._id, razorpayPaymentId, 'Payment confirmed')
}

// A customer may cancel their own order while it's unpaid.
async function cancelUnpaid(user, orderId) {
    const cancelled = await transition({ _id: orderId, user: user._id }, 'pending_payment', 'cancelled', {
        note: 'Cancelled by the customer',
        set: { cancelledAt: new Date(), cancelReason: 'Cancelled by the customer' },
    })
    if (!cancelled) {
        if (!(await Order.exists({ _id: orderId, user: user._id }))) throw ApiError.notFound('Order not found')
        throw ApiError.conflict('Only unpaid orders can be cancelled here. Contact us to cancel a paid order.')
    }
    await releaseStock(orderId)
    return Order.findById(orderId)
}

module.exports = {
    reserveStock,
    releaseStock,
    markPaid,
    expireUnpaid,
    place,
    retryPayment,
    verifyPayment,
    cancelUnpaid,
    transition,
    historyEntry,
}
