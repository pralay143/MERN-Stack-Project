const VendorProduct = require('./vendorProduct.model')

const create = (data) => VendorProduct.create(data)

const list = () => VendorProduct.find().populate('productId').populate('vendorId')

module.exports = { create, list }
