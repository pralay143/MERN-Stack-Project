const asyncHandler = require('../../utils/asyncHandler')
const ApiError = require('../../utils/ApiError')
const { hasRole } = require('../../middleware/auth')
const { assertOwnerOrAdmin } = require('../../utils/ownership')
const productService = require('./product.service')

// Stored image details from the uploadImage middleware's file.
const fileInfo = (file) => ({
    name: file.originalname,
    size: file.size,
    url: `/uploads/${file.filename}`,
    type: file.mimetype,
})

// Expects the multipart form parsed by the uploadImage middleware.
// The product belongs to whoever creates it.
const create = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('Product image is required (form field "file")')

    const product = await productService.create({
        ...req.body,
        user: req.user._id,
        file: fileInfo(req.file),
    })
    res.status(201).json({ message: 'Product added', data: product })
})

// Filtered, sorted and paged (query validated by validateQuery).
const list = asyncHandler(async (req, res) => {
    const { items, meta } = await productService.search(req.validQuery)
    res.json({ message: 'Products found', data: items, meta })
})

const getById = asyncHandler(async (req, res) => {
    res.json({ message: 'Product found', data: await productService.getById(req.params.id) })
})

// Middleware: 404 for a missing product, 403 unless it's the user's own
// (admins may change any product).
const ownerOrAdmin = asyncHandler(async (req, res, next) => {
    const product = await productService.getById(req.params.id)
    assertOwnerOrAdmin(req.user, product.user)
    next()
})

// Vendors may change only their own products; admins any product. A new
// image (multipart field "file") replaces the old one.
const update = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id)
    assertOwnerOrAdmin(req.user, product.user)
    if (!hasRole(req.user, 'admin')) delete req.body.user
    const changes = req.file ? { ...req.body, file: fileInfo(req.file) } : req.body
    res.json({ message: 'Product updated', data: await productService.update(req.params.id, changes) })
})

const remove = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id)
    assertOwnerOrAdmin(req.user, product.user)
    res.json({ message: 'Product removed', data: await productService.remove(req.params.id) })
})

module.exports = { create, list, getById, ownerOrAdmin, update, remove }
