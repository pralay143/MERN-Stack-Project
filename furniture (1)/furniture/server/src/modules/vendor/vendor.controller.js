const asyncHandler = require('../../utils/asyncHandler')
const vendorService = require('./vendor.service')

const create = asyncHandler(async (req, res) => {
    const doc = await vendorService.create(req.body)
    res.status(201).json({ message: 'Vendor added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendors found', data: await vendorService.list() })
})

const getById = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor found', data: await vendorService.getById(req.params.id) })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor updated', data: await vendorService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor removed', data: await vendorService.remove(req.params.id) })
})

module.exports = { create, list, getById, update, remove }
