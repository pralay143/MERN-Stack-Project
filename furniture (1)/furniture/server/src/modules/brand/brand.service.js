const Brand = require('./brand.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => Brand.create(data)

const list = () => Brand.find().populate('categoryId')

const getById = async (id) => ensureFound(await Brand.findById(id).populate('categoryId'), 'Brand')

const update = async (id, data) =>
    ensureFound(await Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Brand')

const remove = async (id) => ensureFound(await Brand.findByIdAndDelete(id), 'Brand')

module.exports = { create, list, getById, update, remove }
