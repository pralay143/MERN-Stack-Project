const asyncHandler = require('../../utils/asyncHandler')
const { setAuthCookie, clearAuthCookie } = require('../../utils/session')
const userService = require('../user/user.service')
const authService = require('./auth.service')

// Creates the account and logs it in.
const register = asyncHandler(async (req, res) => {
    const created = await authService.register(req.body)
    const user = await userService.getById(created._id) // with role populated
    setAuthCookie(res, user)
    res.status(201).json({ message: 'Account created', data: user })
})

const login = asyncHandler(async (req, res) => {
    const user = await authService.login(req.body.email, req.body.password)
    setAuthCookie(res, user)
    res.json({ message: 'Login successful', data: user })
})

const logout = (req, res) => {
    clearAuthCookie(res)
    res.json({ message: 'Logged out' })
}

// The logged-in user (set by requireAuth).
const me = (req, res) => {
    res.json({ message: 'Current user', data: req.user })
}

module.exports = { register, login, logout, me }
