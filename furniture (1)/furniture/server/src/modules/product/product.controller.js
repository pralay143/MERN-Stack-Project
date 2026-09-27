const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const productService = require('./product.service')

// Expects the multipart form parsed by the uploadProductImage middleware.
const create = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Product image is required (form field "file")')

    const product = await productService.create({
        ...req.body,
        file: {
            name: req.file.originalname,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
            type: req.file.mimetype,
        },
    })
    res.status(201).json({ message: 'Product added', data: product })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Products found', data: await productService.list() })
})

const getById = asyncHandler(async (req, res) => {
    res.json({ message: 'Product found', data: await productService.getById(req.params.id) })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Product updated', data: await productService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Product removed', data: await productService.remove(req.params.id) })
})

module.exports = { create, list, getById, update, remove }
