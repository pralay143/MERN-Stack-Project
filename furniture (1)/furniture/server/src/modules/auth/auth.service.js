const Role = require('../role/role.model')
const userService = require('../user/user.service')
const ApiError = require('../../utils/ApiError')

// Public sign-up always creates a Customer. Any role in the request body is
// ignored; only an admin can change a user's role.
const register = async (data) => {
    const customerRole = await Role.findOne({ name: 'Customer' })
    if (!customerRole) throw new Error('The Customer role is missing; run npm run seed')
    return userService.create({ ...data, role: customerRole._id })
}

// Returns the user, or throws 401 without saying which part was wrong.
const login = async (email, password) => {
    if (!email || !password) throw ApiError.badRequest('Email and password are required')
    const user = await userService.authenticate(email, password)
    if (!user) throw ApiError.unauthorized('Invalid email or password')
    return user
}

module.exports = { register, login }
