const asyncHandler = require('../../utils/asyncHandler')
const subcategoryService = require('./subcategory.service')

const create = asyncHandler(async (req, res) => {
    const doc = await subcategoryService.create(req.body)
    res.status(200).json({ message: 'Subcategory added', data: doc })
})

const list = asyncHandler(async (req, res) => {
    res.json({ message: 'Subcategories found', data: await subcategoryService.list() })
})

const update = asyncHandler(async (req, res) => {
    res.json({ message: 'Subcategory updated', data: await subcategoryService.update(req.params.id, req.body) })
})

const remove = asyncHandler(async (req, res) => {
    res.json({ message: 'Subcategory removed', data: await subcategoryService.remove(req.params.id) })
})

module.exports = { create, list, update, remove }
