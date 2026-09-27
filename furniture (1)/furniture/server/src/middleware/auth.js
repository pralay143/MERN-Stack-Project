const User = require('../modules/user/user.model')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { AUTH_COOKIE, verifyToken } = require('../utils/session')

// Requires a valid login cookie. Loads the user fresh from the database, so a
// deleted account or changed role takes effect immediately. Sets req.user.
const requireAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE]
    if (!token) throw ApiError.unauthorized('Please log in')

    let payload
    try {
        payload = verifyToken(token)
    } catch {
        throw ApiError.unauthorized('Your session has expired or is invalid; please log in again')
    }

    const user = await User.findById(payload.sub).populate('role')
    if (!user) throw ApiError.unauthorized('This account no longer exists')

    req.user = user
    next()
})

// Allows only the given roles, e.g. requireRole('admin', 'vendor').
// Use after requireAuth.
const requireRole = (...roles) => {
    const allowed = roles.map((r) => r.toLowerCase())
    return (req, res, next) => {
        if (!req.user) return next(ApiError.unauthorized('Please log in'))
        const role = req.user.role?.name?.toLowerCase()
        if (!allowed.includes(role)) return next(ApiError.forbidden())
        next()
    }
}

const hasRole = (user, role) => user?.role?.name?.toLowerCase() === role.toLowerCase()

module.exports = { requireAuth, requireRole, hasRole }
