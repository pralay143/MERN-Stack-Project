const asyncHandler = require('../../utils/asyncHandler')
const brandService = require('./brand.service')

const create = asyncHandler(async (req, res) => {
    const doc = await brandService.create(req.body)
    res.status(200).json({ message: 'Brand added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Brands found', data: await brandService.list() })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Brand updated', data: await brandService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Brand removed', data: await brandService.remove(req.params.id) })
})

module.exports = { create, list, update, remove }
