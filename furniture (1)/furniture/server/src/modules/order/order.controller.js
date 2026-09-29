const mongoose = require('mongoose')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const Order = require('./order.model')
const orderService = require('./order.service')
const fulfilment = require('./fulfilment.service')
const { hasRole } = require('../../middleware/auth')

const orderIdParam = (req) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid order id')
    return req.params.id
}

// POST /orders: place the cart as an order and get Razorpay Checkout options.
const place = asyncHandler(async (req, res) => {
    const { order, payment } = await orderService.place(req.user, req.body.addressId)
    res.status(201).json({ message: 'Order placed; waiting for payment', data: { order, payment } })
})

// GET /orders: the caller's own orders, newest first.
const listMine = asyncHandler(async (req, res) => {
    await orderService.expireUnpaid()
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10))
    const filter = { user: req.user._id }
    const [items, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Order.countDocuments(filter),
    ])
    res.json({ message: 'Orders found', data: items, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } })
})

// GET /orders/:id: for the buyer, an admin, or a seller with items in it
// (sellers see only their own items).
const get = asyncHandler(async (req, res) => {
    res.json({ message: 'Order found', data: await fulfilment.getForUser(req.user, orderIdParam(req)) })
})

// GET /orders/sold: every order for admins; a seller's paid orders.
const listSold = asyncHandler(async (req, res) => {
    const { items, meta } = await fulfilment.listSold(req.user, req.validQuery)
    res.json({ message: 'Orders found', data: items, meta })
})

// PATCH /orders/:id/items/:productId { status }: a seller (or admin) ships or delivers an item.
const updateItemStatus = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.productId)) throw ApiError.badRequest('Invalid product id')
    const order = await fulfilment.updateItemStatus(req.user, orderIdParam(req), req.params.productId, req.body.status)
    res.json({ message: 'Item updated', data: order })
})

// POST /orders/:id/pay: Razorpay Checkout options to pay an unpaid order.
const retryPayment = asyncHandler(async (req, res) => {
    const { order, payment } = await orderService.retryPayment(req.user, orderIdParam(req))
    res.json({ message: 'Ready to pay', data: { order, payment } })
})

// POST /orders/:id/verify: Razorpay Checkout's response after paying.
const verify = asyncHandler(async (req, res) => {
    const order = await orderService.verifyPayment(req.user, orderIdParam(req), req.body)
    res.json({ message: 'Payment confirmed', data: order })
})

// POST /orders/:id/cancel: the buyer cancels their unpaid order; an admin
// cancels any unpaid order, or a paid one that hasn't shipped.
const cancel = asyncHandler(async (req, res) => {
    const id = orderIdParam(req)
    if (hasRole(req.user, 'admin')) {
        const order = await Order.findById(id)
        if (order && order.status !== 'pending_payment') {
            return res.json({ message: 'Order cancelled', data: await fulfilment.adminCancel(id) })
        }
        if (order && order.user.toString() !== req.user._id.toString()) {
            return res.json({ message: 'Order cancelled', data: await orderService.cancelUnpaid({ _id: order.user }, id) })
        }
    }
    res.json({ message: 'Order cancelled', data: await orderService.cancelUnpaid(req.user, id) })
})

module.exports = { place, listMine, get, listSold, updateItemStatus, retryPayment, verify, cancel }
