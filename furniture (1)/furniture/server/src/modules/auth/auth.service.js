const userService = require('../user/user.service')
const ApiError = require('../../utils/ApiError')

const register = (data) => userService.create(data)

// Returns the user, or throws 401 without saying which part was wrong.
const login = async (email, password) => {
    if (!email || !password) throw ApiError.badRequest('Email and password are required')
    const user = await userService.authenticate(email, password)
    if (!user) throw ApiError.unauthorized('Invalid email or password')
    return user
}

module.exports = { register, login }
