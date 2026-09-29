const Address = require('./address.model')
const ApiError = require('../../utils/ApiError')
const ensureFound = require('../../utils/ensureFound')

const MAX_ADDRESSES = 10

// Every query is scoped to the user, so another user's address is simply
// "not found" (its existence isn't revealed).
const owned = (userId, id) => ({ _id: id, user: userId })

// Default first, then newest.
const list = (userId) => Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 })

const getOwned = async (userId, id) => ensureFound(await Address.findOne(owned(userId, id)), 'Address')

const clearDefault = (userId) => Address.updateMany({ user: userId, isDefault: true }, { isDefault: false })

// The first address is always the default.
async function create(userId, data) {
    const count = await Address.countDocuments({ user: userId })
    if (count >= MAX_ADDRESSES) throw ApiError.badRequest(`You can save up to ${MAX_ADDRESSES} addresses`)
    const isDefault = count === 0 || data.isDefault === true
    if (isDefault) await clearDefault(userId)
    return Address.create({ ...data, user: userId, isDefault })
}

// isDefault: true makes this the default. isDefault: false is ignored, since
// there must always be one default: choose another address instead.
async function update(userId, id, data) {
    const address = await getOwned(userId, id)
    const { isDefault, ...changes } = data
    if (isDefault === true && !address.isDefault) {
        await clearDefault(userId)
        changes.isDefault = true
    }
    Object.assign(address, changes)
    return address.save()
}

// Removing the default makes the newest remaining address the default.
async function remove(userId, id) {
    const address = ensureFound(await Address.findOneAndDelete(owned(userId, id)), 'Address')
    if (address.isDefault) {
        const next = await Address.findOne({ user: userId }).sort({ createdAt: -1 })
        if (next) await Address.updateOne({ _id: next._id }, { isDefault: true })
    }
    return address
}

module.exports = { list, getOwned, create, update, remove, MAX_ADDRESSES }
