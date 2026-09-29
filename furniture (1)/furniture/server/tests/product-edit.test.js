// PATCH /api/v1/products/:id: JSON changes, a replacement image, and
// ownership checked before any file is written.
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, uploadedFiles, removeTestUploads } = require('./helpers/files')
const Category = require('../src/modules/category/category.model')

const v1 = (path) => `/api/v1${path}`

let owner, other, productId

beforeAll(async () => {
    await db.connect()
    owner = await loginAs(app, 'Vendor', 'owner@example.com')
    other = await loginAs(app, 'Vendor', 'other@example.com')
    const category = await Category.create({ categoryName: 'Tables' })
    const res = await owner
        .post(v1('/products'))
        .field('productName', 'Oak Table')
        .field('price', '1500000')
        .field('categoryId', category._id.toString())
        .attach('file', PNG_1PX, { filename: 'table.png', contentType: 'image/png' })
    expect(res.status).toBe(201)
    productId = res.body.data._id
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

test('JSON changes still work', async () => {
    const res = await owner.patch(v1(`/products/${productId}`)).send({ price: 1400000 })
    expect(res.status).toBe(200)
    expect(res.body.data.price).toBe(1400000)
})

test('a multipart PATCH replaces the image along with other fields', async () => {
    const before = (await request(app).get(v1(`/products/${productId}`))).body.data.file.url
    const res = await owner
        .patch(v1(`/products/${productId}`))
        .field('productName', 'Oak Dining Table')
        .attach('file', PNG_1PX, { filename: 'new.png', contentType: 'image/png' })
    expect(res.status).toBe(200)
    expect(res.body.data.productName).toBe('Oak Dining Table')
    expect(res.body.data.file.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/)
    expect(res.body.data.file.url).not.toBe(before)
})

test("another vendor's image upload is refused before the file is stored", async () => {
    const filesBefore = uploadedFiles().length
    const res = await other
        .patch(v1(`/products/${productId}`))
        .attach('file', PNG_1PX, { filename: 'sneaky.png', contentType: 'image/png' })
    expect(res.status).toBe(403)
    expect(uploadedFiles()).toHaveLength(filesBefore)
})

test('a missing product is 404', async () => {
    const res = await owner.patch(v1('/products/66f1a2b3c4d5e6f7a8b9c0d1')).send({ price: 1 })
    expect(res.status).toBe(404)
})
