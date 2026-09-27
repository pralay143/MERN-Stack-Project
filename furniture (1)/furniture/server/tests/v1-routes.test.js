// REST API under /api/v1.
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')

const api = request(app)
const v1 = (path) => `/api/v1${path}`

beforeAll(db.connect)
afterAll(async () => {
    removeTestUploads()
    await db.close()
})

// Full CRUD cycle for a JSON resource.
async function crud(resource, createBody, patchBody, check) {
    const created = await api.post(v1(`/${resource}`)).send(createBody)
    expect(created.status).toBe(201)
    const id = created.body.data._id

    const list = await api.get(v1(`/${resource}`))
    expect(list.status).toBe(200)
    expect(list.body.data.map((d) => d._id)).toContain(id)

    const one = await api.get(v1(`/${resource}/${id}`))
    expect(one.status).toBe(200)

    const patched = await api.patch(v1(`/${resource}/${id}`)).send(patchBody)
    expect(patched.status).toBe(200)
    check(patched.body.data)

    const deleted = await api.delete(v1(`/${resource}/${id}`))
    expect(deleted.status).toBe(200)
    expect((await api.get(v1(`/${resource}/${id}`))).status).toBe(404)
}

describe('auth', () => {
    test('register then login', async () => {
        const role = await api.post(v1('/roles')).send({ name: 'Customer' })
        const reg = await api.post(v1('/auth/register')).send({
            name: 'Asha',
            email: 'asha@example.com',
            password: 'Secret@123',
            gender: 'FEMALE',
            role: role.body.data._id,
        })
        expect(reg.status).toBe(201)

        const login = await api.post(v1('/auth/login')).send({ email: 'asha@example.com', password: 'Secret@123' })
        expect(login.status).toBe(200)
        expect(login.body.data[0].role.name).toBe('Customer')
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
        categoryId = (await api.post(v1('/categories')).send({ categoryName: 'Chairs' })).body.data._id
    })

    test('POST creates a product from a multipart form', async () => {
        const res = await api
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
        const res = await api.get(v1(`/products/${productId}`))
        expect(res.status).toBe(200)
        expect(res.body.data.categoryId.categoryName).toBe('Chairs')
    })

    test('PATCH updates the product', async () => {
        const res = await api.patch(v1(`/products/${productId}`)).send({ productName: 'Wing Chair' })
        expect(res.status).toBe(200)
        expect(res.body.data.productName).toBe('Wing Chair')
    })

    test('DELETE removes the product', async () => {
        expect((await api.delete(v1(`/products/${productId}`))).status).toBe(200)
        expect((await api.get(v1(`/products/${productId}`))).status).toBe(404)
    })
})

describe('list/create-only resources', () => {
    test('states and cities', async () => {
        const state = await api.post(v1('/states')).send({ stateName: 'Kerala' })
        expect(state.status).toBe(201)
        const city = await api.post(v1('/cities')).send({ cityName: 'Kochi', state: state.body.data._id })
        expect(city.status).toBe(201)
        const cities = await api.get(v1('/cities'))
        expect(cities.body.data.find((c) => c.cityName === 'Kochi').state.stateName).toBe('Kerala')
    })

    test('vendor-products', async () => {
        expect((await api.post(v1('/vendor-products')).send({ qty: 4 })).status).toBe(201)
        expect((await api.get(v1('/vendor-products'))).body.data.length).toBeGreaterThan(0)
    })

    test('uploads', async () => {
        const res = await api.post(v1('/uploads')).attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(201)
        expect(res.body.data.name).toBe(TEST_IMAGE_NAME)
    })
})
