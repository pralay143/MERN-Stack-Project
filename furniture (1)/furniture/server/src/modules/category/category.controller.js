const asyncHandler = require('../../utils/asyncHandler')
const categoryService = require('./category.service')

const create = asyncHandler(async (req, res) => {
    const doc = await categoryService.create(req.body)
    res.status(201).json({ message: 'Category added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Categories found', data: await categoryService.list() })
})

const getById = asyncHandler(async (req, res) => {
    res.json({ message: 'Category found', data: await categoryService.getById(req.params.id) })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Category updated', data: await categoryService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Category removed', data: await categoryService.remove(req.params.id) })
})

module.exports = { create, list, getById, update, remove }
