const mongoose = require('mongoose')
const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const cartService = require('./cart.service')

// Every handler works on the logged-in user's own cart only.

const productIdParam = (req) => {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) throw ApiError.badRequest('Invalid product id')
    return productId
}

const get = asyncHandler(async (req, res) => {
    res.json({ message: 'Cart', data: await cartService.get(req.user._id) })
})

const setQuantity = asyncHandler(async (req, res) => {
    const cart = await cartService.setQuantity(req.user._id, productIdParam(req), req.body.quantity)
    res.json({ message: 'Cart updated', data: cart })
})

const removeItem = asyncHandler(async (req, res) => {
    res.json({ message: 'Removed from cart', data: await cartService.removeItem(req.user._id, productIdParam(req)) })
})

const clear = asyncHandler(async (req, res) => {
    res.json({ message: 'Cart emptied', data: await cartService.clear(req.user._id) })
})

const merge = asyncHandler(async (req, res) => {
    res.json({ message: 'Cart updated', data: await cartService.merge(req.user._id, req.body.items) })
})

module.exports = { get, setQuantity, removeItem, clear, merge }
