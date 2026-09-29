const asyncHandler = require('../../utils/asyncHandler')
const addressService = require('./address.service')

// Every handler works on the logged-in user's own addresses only.

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Addresses found', data: await addressService.list(req.user._id) })
})

const create = asyncHandler(async (req, res) => {
    res.status(201).json({ message: 'Address added', data: await addressService.create(req.user._id, req.body) })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Address updated', data: await addressService.update(req.user._id, req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Address removed', data: await addressService.remove(req.user._id, req.params.id) })
})

module.exports = { list, create, update, remove }
