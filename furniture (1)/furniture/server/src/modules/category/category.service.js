const Category = require('./category.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => Category.create(data)

const list = () => Category.find()

const update = async (id, data) =>
    ensureFound(await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Category')

const remove = async (id) => ensureFound(await Category.findByIdAndDelete(id), 'Category')

module.exports = { create, list, update, remove }
