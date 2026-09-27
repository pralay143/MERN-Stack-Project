const asyncHandler = require('../../utils/asyncHandler')
const vendorProductService = require('./vendorProduct.service')

const create = asyncHandler(async (req, res) => {
    const doc = await vendorProductService.create(req.body)
    res.status(201).json({ message: 'Vendor product added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor products found', data: await vendorProductService.list() })
})

module.exports = { create, list }
