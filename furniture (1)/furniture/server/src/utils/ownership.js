const ApiError = require('./ApiError')
const { hasRole } = require('../middleware/auth')

const idOf = (value) => (value?._id ?? value)?.toString()

// True when `owner` (an id or a populated document) is the given user.
const isOwner = (user, owner) => owner != null && idOf(owner) === idOf(user)

// Admins may act on anything; everyone else only on what they own.
function assertOwnerOrAdmin(user, owner) {
    if (hasRole(user, 'admin') || isOwner(user, owner)) return
    throw ApiError.forbidden('You can only change your own records')
}

module.exports = { isOwner, assertOwnerOrAdmin }
