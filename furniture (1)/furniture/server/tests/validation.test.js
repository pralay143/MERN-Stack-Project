// Request body validation (Zod) and mass-assignment protection.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs, PASSWORD } = require('./helpers/auth')
const { PNG_1PX, TEST_IMAGE_NAME, uploadedFiles, removeTestUploads } = require('./helpers/files')
const User = require('../src/modules/user/user.model')
const Category = require('../src/modules/category/category.model')

const api = request(app)
const v1 = (path) => `/api/v1${path}`
const anyId = () => new mongoose.Types.ObjectId().toString()

let admin, vendor

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
    vendor = await loginAs(app, 'Vendor')
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

describe('field errors', () => {
    test('registration reports each invalid field', async () => {
        const res = await api.post(v1('/auth/register')).send({ email: 'not-an-email', password: 'short' })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Validation failed')
        expect(res.body.errors).toEqual({
            name: 'Name is required',
            email: 'Enter a valid email address',
            password: 'Password must be at least 8 characters',
        })
    })

    test('the legacy sign-up route validates too', async () => {
        const res = await api.post('/user/user').send({ name: 'Old', email: 'old@example.com', password: '123' })
        expect(res.status).toBe(400)
        expect(res.body.errors.password).toMatch(/at least 8/)
    })

    test('ids in the body must be valid ObjectIds', async () => {
        const res = await admin.post(v1('/subcategories')).send({ subcategoryName: 'Recliners', categoryDetail: 'abc' })
        expect(res.status).toBe(400)
        expect(res.body.errors.categoryDetail).toBe('Category must be a valid id')
    })

    test('numbers sent as text in a multipart form are checked', async () => {
        const res = await vendor
            .post(v1('/products'))
            .field('productName', 'Stool')
            .field('categoryId', anyId())
            .field('price', 'cheap')
            .attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(400)
        expect(res.body.errors.price).toBe('Price must be a number')
    })

    test('vendor pincode must be 6 digits', async () => {
        const res = await vendor.post(v1('/vendors')).send({ vendorName: 'Pin Shop', pincode: '12AB' })
        expect(res.status).toBe(400)
        expect(res.body.errors.pincode).toBe('Pincode must be 6 digits')
    })

    test('text fields are trimmed and length-limited', async () => {
        const long = await admin.post(v1('/categories')).send({ categoryName: 'x'.repeat(101) })
        expect(long.status).toBe(400)
        const trimmed = await admin.post(v1('/categories')).send({ categoryName: '  Recliners  ' })
        expect(trimmed.body.data.categoryName).toBe('Recliners')
    })
})

describe('mass assignment', () => {
    test('unknown and internal fields are dropped at registration', async () => {
        const forcedId = anyId()
        const res = await api.post(v1('/auth/register')).send({
            name: 'Mass',
            email: 'mass@example.com',
            password: PASSWORD,
            _id: forcedId,
            createdAt: '2000-01-01T00:00:00.000Z',
            isAdmin: true,
        })
        expect(res.status).toBe(201)
        const stored = await User.findOne({ email: 'mass@example.com' }).lean()
        expect(stored._id.toString()).not.toBe(forcedId)
        expect(stored.createdAt.getFullYear()).not.toBe(2000)
        expect(stored.isAdmin).toBeUndefined()
    })

    test('a profile update cannot change the password', async () => {
        const customer = await loginAs(app, 'Customer')
        const res = await customer.patch(v1(`/users/${customer.user._id}`)).send({ name: 'Still me', password: 'NewPass@999' })
        expect(res.status).toBe(200)
        const login = await api.post(v1('/auth/login')).send({ email: 'customer@example.com', password: PASSWORD })
        expect(login.status).toBe(200)
    })

    test('an update cannot overwrite timestamps or ids', async () => {
        const category = await Category.create({ categoryName: 'Ottomans' })
        const res = await admin
            .patch(v1(`/categories/${category._id}`))
            .send({ categoryName: 'Poufs', _id: anyId(), createdAt: '2000-01-01T00:00:00.000Z' })
        expect(res.status).toBe(200)
        expect(res.body.data._id).toBe(category._id.toString())
        expect(new Date(res.body.data.createdAt).getFullYear()).not.toBe(2000)
    })
})

test('a product rejected by validation leaves no uploaded file behind', async () => {
    const before = uploadedFiles().length
    const res = await vendor.post(v1('/products')).field('productName', 'Nothing else').attach('file', PNG_1PX, TEST_IMAGE_NAME)
    expect(res.status).toBe(400)
    // The error handler removes the file asynchronously.
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(uploadedFiles().length).toBe(before)
})
