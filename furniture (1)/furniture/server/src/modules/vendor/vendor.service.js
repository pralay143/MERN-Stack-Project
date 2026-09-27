const Vendor = require('./vendor.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => Vendor.create(data)

const list = () => Vendor.find().populate('userId').populate('cityId').populate('stateId')

const getById = async (id) => ensureFound(await Vendor.findById(id).populate('userId').populate('cityId').populate('stateId'), 'Vendor')

const update = async (id, data) =>
    ensureFound(await Vendor.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Vendor')

const remove = async (id) => ensureFound(await Vendor.findByIdAndDelete(id), 'Vendor')

module.exports = { create, list, getById, update, remove }
