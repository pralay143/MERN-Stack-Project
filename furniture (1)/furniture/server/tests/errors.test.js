// Error responses: correct status codes, JSON bodies, no internal details.
const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')

const api = request(app)
const missingId = () => new mongoose.Types.ObjectId().toString()

let admin // for routes that need a login

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
})
afterAll(db.close)

test('unknown route returns 404 JSON', async () => {
    const res = await api.get('/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/Route not found/)
})

test('malformed id returns 400', async () => {
    const res = await admin.get('/user/user/not-an-id')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Invalid value/)
})

test('id that does not exist returns 404', async () => {
    const res = await admin.get(`/user/user/${missingId()}`)
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('User not found')
})

test('deleting a missing record returns 404', async () => {
    const res = await admin.delete(`/product/product/${missingId()}`)
    expect(res.status).toBe(404)
})

test('invalid JSON body returns 400', async () => {
    const res = await api.post('/user/user').set('Content-Type', 'application/json').send('{"name":')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/not valid JSON/)
})

test('schema validation errors return 400 with field messages', async () => {
    const res = await admin.post('/role/role').send({})
    expect(res.status).toBe(400)
    expect(res.body.errors.name).toBeDefined()
})

test('login without a password returns 400', async () => {
    const res = await api.post('/user/user/login').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
})

test('login with wrong credentials returns 401', async () => {
    const res = await api.post('/user/user/login').send({ email: 'nobody@example.com', password: 'x' })
    expect(res.status).toBe(401)
})

test('adding a product without an image returns 400 instead of crashing', async () => {
    const res = await admin
        .post('/product/product')
        .field('productName', 'No image')
        .field('basePrice', '100')
        .field('categoryId', missingId())
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/image is required/)
})

test('error responses do not leak stack traces', async () => {
    const res = await admin.get('/user/user/not-an-id')
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.js/)
    expect(res.body.stack).toBeUndefined()
})
