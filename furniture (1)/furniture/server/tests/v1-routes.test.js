// REST API under /api/v1, exercised as an admin (who may do everything).
// Permissions are covered by access.test.js and ownership.test.js.
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')

const api = request(app)
const v1 = (path) => `/api/v1${path}`

let admin

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
})
afterAll(async () => {
    removeTestUploads()
    await db.close()
})

// Full CRUD cycle for a JSON resource.
async function crud(resource, createBody, patchBody, check) {
    const created = await admin.post(v1(`/${resource}`)).send(createBody)
    expect(created.status).toBe(201)
    const id = created.body.data._id

    const list = await admin.get(v1(`/${resource}`))
    expect(list.status).toBe(200)
    expect(list.body.data.map((d) => d._id)).toContain(id)

    const one = await admin.get(v1(`/${resource}/${id}`))
    expect(one.status).toBe(200)

    const patched = await admin.patch(v1(`/${resource}/${id}`)).send(patchBody)
    expect(patched.status).toBe(200)
    check(patched.body.data)

    const deleted = await admin.delete(v1(`/${resource}/${id}`))
    expect(deleted.status).toBe(200)
    expect((await admin.get(v1(`/${resource}/${id}`))).status).toBe(404)
}

describe('auth', () => {
    test('register then login', async () => {
        const reg = await api.post(v1('/auth/register')).send({
            name: 'Asha',
            email: 'asha@example.com',
            password: 'Secret@123',
            gender: 'FEMALE',
        })
        expect(reg.status).toBe(201)

        const login = await api.post(v1('/auth/login')).send({ email: 'asha@example.com', password: 'Secret@123' })
        expect(login.status).toBe(200)
        expect(login.body.data.role.name).toBe('Customer')
    })
})

describe('CRUD resources', () => {
    test('users', () =>
        crud('users', { name: 'Ravi', email: 'ravi@example.com', password: 'x', gender: 'MALE' }, { name: 'Ravi K' }, (u) =>
            expect(u.name).toBe('Ravi K')
        ))

    test('categories', () =>
        crud('categories', { categoryName: 'Beds' }, { categoryName: 'Beds & Mattresses' }, (c) =>
            expect(c.categoryName).toBe('Beds & Mattresses')
        ))

    test('brands', () =>
        crud('brands', { brandName: 'Teak Co' }, { brandName: 'Teak & Co' }, (b) => expect(b.brandName).toBe('Teak & Co')))

    test('vendors', () =>
        crud('vendors', { vendorName: 'Shop A' }, { vendorName: 'Shop B' }, (v) => expect(v.vendorName).toBe('Shop B')))
})

describe('products', () => {
    let categoryId, productId

    beforeAll(async () => {
        categoryId = (await admin.post(v1('/categories')).send({ categoryName: 'Chairs' })).body.data._id
    })

    test('POST creates a product from a multipart form', async () => {
        const res = await admin
            .post(v1('/products'))
            .field('productName', 'Arm Chair')
            .field('categoryId', categoryId)
            .field('price', '1200000') // ₹12,000 in paise
            .attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(201)
        expect(res.body.data.file.url).toMatch(/^\/uploads\//)
        productId = res.body.data._id
    })

    test('GET /:id returns the product with its category', async () => {
        const res = await admin.get(v1(`/products/${productId}`))
        expect(res.status).toBe(200)
        expect(res.body.data.categoryId.categoryName).toBe('Chairs')
    })

    test('PATCH updates the product', async () => {
        const res = await admin.patch(v1(`/products/${productId}`)).send({ productName: 'Wing Chair' })
        expect(res.status).toBe(200)
        expect(res.body.data.productName).toBe('Wing Chair')
    })

    test('DELETE removes the product', async () => {
        expect((await admin.delete(v1(`/products/${productId}`))).status).toBe(200)
        expect((await admin.get(v1(`/products/${productId}`))).status).toBe(404)
    })
})

describe('list/create-only resources', () => {
    test('states and cities', async () => {
        const state = await admin.post(v1('/states')).send({ stateName: 'Kerala' })
        expect(state.status).toBe(201)
        const city = await admin.post(v1('/cities')).send({ cityName: 'Kochi', state: state.body.data._id })
        expect(city.status).toBe(201)
        const cities = await admin.get(v1('/cities'))
        expect(cities.body.data.find((c) => c.cityName === 'Kochi').state.stateName).toBe('Kerala')
    })

    test('vendor-products', async () => {
        expect((await admin.post(v1('/vendor-products')).send({ qty: 4 })).status).toBe(201)
        expect((await admin.get(v1('/vendor-products'))).body.data.length).toBeGreaterThan(0)
    })

    test('uploads', async () => {
        const res = await admin.post(v1('/uploads')).attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(201)
        expect(res.body.data.name).toBe(TEST_IMAGE_NAME)
    })
})
