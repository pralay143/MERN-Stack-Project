const asyncHandler = require('../../utils/asyncHandler')
const stateService = require('./state.service')

const create = asyncHandler(async (req, res) => {
    const doc = await stateService.create(req.body)
    res.status(201).json({ message: 'State added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'States found', data: await stateService.list() })
})

module.exports = { create, list }
