const Product = require('./product.model')
const ensureFound = require('../../utils/ensureFound')

const withRefs = (query) => query.populate('categoryId').populate('brandId')

const create = (data) => Product.create(data)

// Every product, unpaged. Only the legacy client's list uses this.
const list = () => withRefs(Product.find())

const SORT_ORDER = {
    newest: { createdAt: -1, _id: -1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: -1 },
    name: { productName: 1, _id: 1 },
}

// Escapes regex special characters so a search is always matched literally.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// One page of products matching the (already validated) filters, plus the
// total count for pagination.
async function search({ q, category, brand, minPrice, maxPrice, sort, page, limit }) {
    const filter = {}
    if (q) {
        const pattern = new RegExp(escapeRegex(q), 'i')
        filter.$or = [{ productName: pattern }, { description: pattern }]
    }
    if (category) filter.categoryId = category
    if (brand) filter.brandId = brand
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {}
        if (minPrice !== undefined) filter.price.$gte = minPrice
        if (maxPrice !== undefined) filter.price.$lte = maxPrice
    }

    const [items, total] = await Promise.all([
        withRefs(
            Product.find(filter)
                .sort(SORT_ORDER[sort])
                .skip((page - 1) * limit)
                .limit(limit)
        ),
        Product.countDocuments(filter),
    ])
    return { items, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } }
}

const getById = async (id) => ensureFound(await withRefs(Product.findById(id)), 'Product')

const update = async (id, data) =>
    ensureFound(await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }), 'Product')

const remove = async (id) => ensureFound(await Product.findByIdAndDelete(id), 'Product')

module.exports = { create, list, search, getById, update, remove }
