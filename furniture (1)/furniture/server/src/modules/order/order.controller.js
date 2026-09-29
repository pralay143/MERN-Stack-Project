const mongoose = require('mongoose')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const Order = require('./order.model')
const orderService = require('./order.service')

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

// GET /orders/:id: the caller's own order.
const getMine = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: orderIdParam(req), user: req.user._id })
    if (!order) throw ApiError.notFound('Order not found')
    res.json({ message: 'Order found', data: order })
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

// POST /orders/:id/cancel: the customer cancels an unpaid order.
const cancel = asyncHandler(async (req, res) => {
    res.json({ message: 'Order cancelled', data: await orderService.cancelUnpaid(req.user, orderIdParam(req)) })
})

module.exports = { place, listMine, getMine, retryPayment, verify, cancel }
