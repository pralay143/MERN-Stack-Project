const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const { hasRole } = require('../../middleware/auth')
const vendorService = require('../vendor/vendor.service')
const vendorProductService = require('./vendorProduct.service')

// A vendor adds stock to their own vendor profile; an admin may choose any.
const create = asyncHandler(async (req, res) => {
    let { vendorId } = req.body
    if (!hasRole(req.user, 'admin')) {
        const vendor = await vendorService.findByUser(req.user._id)
        if (!vendor) throw ApiError.badRequest('Create your vendor profile before adding products')
        vendorId = vendor._id
    }
    const doc = await vendorProductService.create({ ...req.body, vendorId })
    res.status(201).json({ message: 'Vendor product added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor products found', data: await vendorProductService.list() })
})

module.exports = { create, list }
