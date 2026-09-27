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

    const user = await userService.authenticate(email, password)
    if (!user) throw ApiError.unauthorized('Invalid email or password')

    // An array, as the legacy client expects (it reads data[0]).
    res.json({ message: 'Login successful', data: [user] })
})

module.exports = { create, list, getById, update, remove, login }
