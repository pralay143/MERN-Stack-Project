const Product = require('./product.model')
const ensureFound = require('../../utils/ensureFound')

const create = (data) => Product.create(data)

const list = () => Product.find().populate('categoryId').populate('brandId')

const getById = async (id) => ensureFound(await Product.findById(id).populate('categoryId').populate('brandId'), 'Product')

const update = async (id, data) =>
    ensureFound(await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Product')

const remove = async (id) => ensureFound(await Product.findByIdAndDelete(id), 'Product')

module.exports = { create, list, getById, update, remove }
