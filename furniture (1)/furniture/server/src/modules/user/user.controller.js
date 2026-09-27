const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const { hasRole } = require('../../middleware/auth')
const { assertOwnerOrAdmin } = require('../../utils/ownership')
const userService = require('./user.service')

// Admin only: create a user with any role.
const create = asyncHandler(async (req, res) => {
    const user = await userService.create(req.body)
    res.status(201).json({ message: 'User added', data: user })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Users found', data: await userService.list() })
})

// Admins, or the user themselves.
const getById = asyncHandler(async (req, res) => {
    assertOwnerOrAdmin(req.user, req.params.id)
    res.json({ message: 'User found', data: await userService.getById(req.params.id) })
})

// Admins, or the user themselves. Only admins may change a role.
const update = asyncHandler(async (req, res) => {
    assertOwnerOrAdmin(req.user, req.params.id)
    if (req.body.role !== undefined && !hasRole(req.user, 'admin')) {
        throw ApiError.forbidden('Only an admin can change roles')
    }
    res.json({ message: 'User updated', data: await userService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'User removed', data: await userService.remove(req.params.id) })
})

module.exports = { create, list, getById, update, remove }
