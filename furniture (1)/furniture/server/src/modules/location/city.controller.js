const asyncHandler = require('../../utils/asyncHandler')
const cityService = require('./city.service')

const create = asyncHandler(async (req, res) => {
    const doc = await cityService.create(req.body)
    res.status(201).json({ message: 'City added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Cities found', data: await cityService.list() })
})

module.exports = { create, list }
