// GET /api/v1/products: search, filters, sorting and paging.
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { createRoles } = require('./helpers/auth')
const Category = require('../src/modules/category/category.model')
const Brand = require('../src/modules/brand/brand.model')
const Product = require('../src/modules/product/product.model')

const api = request(app)
const list = (query = {}) => api.get('/api/v1/products').query(query)
const names = (res) => res.body.data.map((p) => p.productName)

let sofas, beds, teak

beforeAll(async () => {
    await db.connect()
    await createRoles()
    sofas = await Category.create({ categoryName: 'Sofas' })
    beds = await Category.create({ categoryName: 'Beds' })
    teak = await Brand.create({ brandName: 'Teak Co' })
    const day = (n) => new Date(Date.UTC(2026, 0, n))
    // Inserted directly so createdAt can be controlled for the "newest" sort.
    await Product.insertMany([
        { productName: 'Chesterfield Sofa', description: 'Deep buttoned leather', price: 5500000, categoryId: sofas._id, brandId: teak._id, createdAt: day(1) },
        { productName: 'Compact Loveseat', description: 'Two-seater for small rooms', price: 2200000, categoryId: sofas._id, createdAt: day(2) },
        { productName: 'Queen Bed', description: 'Solid teak frame', price: 4000000, categoryId: beds._id, brandId: teak._id, createdAt: day(3) },
        { productName: 'Bunk Bed (twin)', description: 'For kids', price: 3000000, categoryId: beds._id, createdAt: day(4) },
    ])
})
afterAll(db.close)

test('defaults: newest first, page 1 of 12, with meta', async () => {
    const res = await list()
    expect(res.status).toBe(200)
    expect(names(res)).toEqual(['Bunk Bed (twin)', 'Queen Bed', 'Compact Loveseat', 'Chesterfield Sofa'])
    expect(res.body.meta).toEqual({ page: 1, limit: 12, total: 4, pages: 1 })
    expect(res.body.data[0].categoryId.categoryName).toBe('Beds')
})

test('searches name and description, case-insensitively', async () => {
    expect(names(await list({ q: 'sofa' }))).toEqual(['Chesterfield Sofa'])
    expect(names(await list({ q: 'TEAK' }))).toEqual(['Queen Bed']) // description match
})

test('search text is matched literally, not as a pattern', async () => {
    expect(names(await list({ q: '(twin)' }))).toEqual(['Bunk Bed (twin)'])
    expect((await list({ q: '.*' })).body.data).toEqual([])
})

test('filters by category and brand', async () => {
    expect(names(await list({ category: beds._id.toString() }))).toEqual(['Bunk Bed (twin)', 'Queen Bed'])
    expect(names(await list({ brand: teak._id.toString(), sort: 'name' }))).toEqual(['Chesterfield Sofa', 'Queen Bed'])
})

test('filters by price range in paise (inclusive)', async () => {
    const res = await list({ minPrice: 3000000, maxPrice: 4000000, sort: 'price_asc' })
    expect(names(res)).toEqual(['Bunk Bed (twin)', 'Queen Bed'])
})

test('sorts by price and name', async () => {
    expect(names(await list({ sort: 'price_asc' }))[0]).toBe('Compact Loveseat')
    expect(names(await list({ sort: 'price_desc' }))[0]).toBe('Chesterfield Sofa')
    expect(names(await list({ sort: 'name' }))).toEqual(['Bunk Bed (twin)', 'Chesterfield Sofa', 'Compact Loveseat', 'Queen Bed'])
})

test('pages through results', async () => {
    const page2 = await list({ sort: 'price_asc', limit: 3, page: 2 })
    expect(names(page2)).toEqual(['Chesterfield Sofa'])
    expect(page2.body.meta).toEqual({ page: 2, limit: 3, total: 4, pages: 2 })
})

test('empty parameters are ignored', async () => {
    const res = await list({ q: '', category: '', minPrice: '', sort: '' })
    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(4)
})

test('invalid parameters get 400 with a message per field', async () => {
    const res = await list({ category: 'abc', sort: 'cheapest', limit: 500, page: 0 })
    expect(res.status).toBe(400)
    expect(Object.keys(res.body.errors).sort()).toEqual(['category', 'limit', 'page', 'sort'])
})

test('malformed query values get 400, not a crash', async () => {
    // Repeated keys arrive as arrays and bracket keys as objects (qs parsing).
    for (const query of ['sort=name&sort=price_asc', 'q[$regex]=.*', 'category[$ne]=x', 'page=abc', 'limit=2.5']) {
        const res = await api.get(`/api/v1/products?${query}`)
        expect(res.status).toBe(400)
        expect(res.body.errors).toBeDefined()
    }
})

test('a page past the end is empty but keeps the totals', async () => {
    const res = await list({ page: 9 })
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.meta).toEqual({ page: 9, limit: 12, total: 4, pages: 1 })
})

test('a minimum above the maximum is rejected', async () => {
    const res = await list({ minPrice: 500, maxPrice: 100 })
    expect(res.status).toBe(400)
    expect(res.body.errors.minPrice).toMatch(/must not be above/)
})

test('the legacy list still returns every product', async () => {
    const res = await api.get('/product/product')
    expect(res.body.products).toHaveLength(4)
})
