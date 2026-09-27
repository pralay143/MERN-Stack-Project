const asyncHandler = require('../../utils/asyncHandler')
const { hasRole } = require('../../middleware/auth')
const { assertOwnerOrAdmin } = require('../../utils/ownership')
const vendorService = require('./vendor.service')

// A vendor creates their own profile; an admin may create one for any user.
const create = asyncHandler(async (req, res) => {
    const userId = hasRole(req.user, 'admin') ? req.body.userId : req.user._id
    const vendor = await vendorService.create({ ...req.body, userId })
    res.status(201).json({ message: 'Vendor added', data: vendor })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendors found', data: await vendorService.list() })
})

// Admins, or the vendor who owns the profile.
const getById = asyncHandler(async (req, res) => {
    const vendor = await vendorService.getById(req.params.id)
    assertOwnerOrAdmin(req.user, vendor.userId)
    res.json({ message: 'Vendor found', data: vendor })
})

const update = asyncHandler(async (req, res) => {
    const vendor = await vendorService.getById(req.params.id)
    assertOwnerOrAdmin(req.user, vendor.userId)
    if (!hasRole(req.user, 'admin')) delete req.body.userId
    res.json({ message: 'Vendor updated', data: await vendorService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Vendor removed', data: await vendorService.remove(req.params.id) })
})

module.exports = { create, list, getById, update, remove }
