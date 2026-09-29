const { z, text, optionalText, objectId, paise } = require('../../utils/validators')

// Sent as a multipart form (with the image), so numbers arrive as strings.
// The owner (user) is set from the login, never from the body.
const create = z.object({
    productName: text('Product name', 200),
    description: optionalText('Description', 5000),
    price: paise('Price'),
    categoryId: objectId('Category'),
    brandId: objectId('Brand').optional(),
})

const update = create.partial()

const SORTS = ['newest', 'price_asc', 'price_desc', 'name']

// GET /products?q=&category=&brand=&seller=&minPrice=&maxPrice=&sort=&page=&limit=
// Query values arrive as strings; empty ones are treated as not set.
const emptyAsUndefined = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema)

const listQuery = z
    .object({
        q: emptyAsUndefined(z.string().trim().max(100, 'Search must be at most 100 characters').optional()),
        category: emptyAsUndefined(objectId('Category').optional()),
        brand: emptyAsUndefined(objectId('Brand').optional()),
        // The user who listed the product (a vendor's own products).
        seller: emptyAsUndefined(objectId('Seller').optional()),
        minPrice: emptyAsUndefined(paise('Minimum price').optional()),
        maxPrice: emptyAsUndefined(paise('Maximum price').optional()),
        sort: emptyAsUndefined(z.enum(SORTS, `Sort must be one of: ${SORTS.join(', ')}`).default('newest')),
        page: emptyAsUndefined(z.coerce.number().int().min(1, 'Page must be 1 or more').default(1)),
        limit: emptyAsUndefined(z.coerce.number().int().min(1).max(48, 'Limit must be at most 48').default(12)),
    })
    .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
        message: 'Minimum price must not be above the maximum price',
        path: ['minPrice'],
    })

module.exports = { create, update, listQuery, SORTS }
