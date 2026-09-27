const User = require('./user.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => User.create(data)

const list = () => User.find().populate('role')

const getById = async (id) => ensureFound(await User.findById(id).populate('role'), 'User')

const update = async (id, data) =>
    ensureFound(await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'User')

const remove = async (id) => ensureFound(await User.findByIdAndDelete(id), 'User')

// Returns the user when the email and password match, otherwise null.
const authenticate = async (email, password) => {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).populate('role')
    if (!user || !(await user.comparePassword(password))) return null
    return user
}

module.exports = { create, list, getById, update, remove, authenticate }
