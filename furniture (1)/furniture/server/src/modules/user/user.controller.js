const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const userService = require('./user.service')

const create = asyncHandler(async (req, res) => {
    const user = await userService.create(req.body)
    res.status(201).json({ message: 'User added', data: user })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Users found', data: await userService.list() })
})

const getById = asyncHandler(async (req, res) => {
    res.json({ message: 'User found', data: await userService.getById(req.params.id) })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'User updated', data: await userService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'User removed', data: await userService.remove(req.params.id) })
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) throw ApiError.badRequest('Email and password are required')

    const users = await userService.findByCredentials(email, password)
    if (users.length === 0) throw ApiError.unauthorized('Invalid email or password')

    res.json({ message: 'Login successful', data: users })
})

module.exports = { create, list, getById, update, remove, login }
