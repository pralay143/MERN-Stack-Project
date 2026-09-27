const User = require('./user.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => User.create(data)

const list = () => User.find().populate('role')

const getById = async (id) => ensureFound(await User.findById(id).populate('role'), 'User')

const update = async (id, data) =>
    ensureFound(await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'User')

const remove = async (id) => ensureFound(await User.findByIdAndDelete(id), 'User')

// Plain-text comparison is temporary; it is replaced by hashed passwords
// when authentication is added.
const findByCredentials = (email, password) => User.find({ email, password }).populate('role')

module.exports = { create, list, getById, update, remove, findByCredentials }
