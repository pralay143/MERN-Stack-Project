const Subcategory = require('./subcategory.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => Subcategory.create(data)

const list = () => Subcategory.find().populate('categoryDetail')

const update = async (id, data) =>
    ensureFound(await Subcategory.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Subcategory')

const remove = async (id) => ensureFound(await Subcategory.findByIdAndDelete(id), 'Subcategory')

module.exports = { create, list, update, remove }
