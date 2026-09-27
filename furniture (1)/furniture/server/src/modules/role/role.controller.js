const asyncHandler = require('../../utils/asyncHandler')
const roleService = require('./role.service')

const create = asyncHandler(async (req, res) => {
    const doc = await roleService.create(req.body)
    res.status(200).json({ message: 'Role added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Roles found', data: await roleService.list() })
})

module.exports = { create, list }
