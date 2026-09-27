// Model fixes: references, validation, paise prices and legacy field mapping.
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')

const v1 = (path) => `/api/v1${path}`

let categoryId, admin // run as an admin; permissions are tested elsewhere

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
    categoryId = (await admin.post(v1('/categories')).send({ categoryName: 'Tables' })).body.data._id
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

const addProduct = (fields) => {
    const req = admin.post(v1('/products'))
    for (const [k, v] of Object.entries(fields)) req.field(k, v)
    return req.attach('file', PNG_1PX, TEST_IMAGE_NAME)
}

describe('references', () => {
    test('subcategory list populates its category (was a broken reference)', async () => {
        await admin.post(v1('/subcategories')).send({ subcategoryName: 'Coffee tables', categoryDetail: categoryId })
        const res = await admin.get(v1('/subcategories'))
        expect(res.status).toBe(200)
        expect(res.body.data[0].categoryDetail.categoryName).toBe('Tables')
    })
})

describe('users', () => {
    const user = { name: 'Meera', email: 'Meera@Example.com ', password: 'x' }

    test('email is required ("require" typo fixed) and stored lowercased', async () => {
        expect((await admin.post(v1('/users')).send({ name: 'No email', password: 'x' })).status).toBe(400)

        const res = await admin.post(v1('/users')).send(user)
        expect(res.status).toBe(201)
        expect(res.body.data.email).toBe('meera@example.com')
        expect(res.body.data.createdAt).toBeDefined()
    })

    test('duplicate email returns 409', async () => {
        const res = await admin.post(v1('/users')).send(user)
        expect(res.status).toBe(409)
    })
})

describe('roles', () => {
    test('only Admin, Vendor and Customer are allowed', async () => {
        expect((await admin.post(v1('/roles')).send({ name: 'Superuser' })).status).toBe(400)
    })
})

describe('product prices in paise', () => {
    test('price is stored as an integer number of paise', async () => {
        const res = await addProduct({ productName: 'Side table', categoryId, price: '450000' })
        expect(res.status).toBe(201)
        expect(res.body.data.price).toBe(450000)
    })

    test('fractional paise are rejected', async () => {
        expect((await addProduct({ productName: 'Bad', categoryId, price: '99.5' })).status).toBe(400)
    })

    test('negative prices are rejected', async () => {
        expect((await addProduct({ productName: 'Bad', categoryId, price: '-100' })).status).toBe(400)
    })

    test('a product needs a category and a price', async () => {
        const res = await addProduct({ productName: 'Incomplete' })
        expect(res.status).toBe(400)
        expect(Object.keys(res.body.errors)).toEqual(expect.arrayContaining(['price', 'categoryId']))
    })
})

describe('legacy client field mapping', () => {
    test('basePrice in rupees is stored as paise and shown back in rupees', async () => {
        const created = await admin
            .post('/product/product')
            .field('productName', 'Dining table')
            .field('categoryId', categoryId)
            .field('basePrice', '25500.50')
            .attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(created.body.data.price).toBe(2550050)

        const legacyList = await admin.get('/product/product')
        const legacyProduct = legacyList.body.products.find((p) => p.productName === 'Dining table')
        expect(legacyProduct.basePrice).toBe(25500.5)
    })

    test('vendor form fields user/state/city are saved as userId/stateId/cityId', async () => {
        const state = (await admin.post(v1('/states')).send({ stateName: 'Punjab' })).body.data._id
        const city = (await admin.post(v1('/cities')).send({ cityName: 'Amritsar', state })).body.data._id
        const user = (await admin.post(v1('/users')).send({ name: 'V', email: 'v@example.com', password: 'x' })).body.data._id

        const res = await admin.post('/vendor/vendor').send({ vendorName: 'Punjab Woods', user, state, city })
        expect(res.status).toBe(201)

        const vendor = (await admin.get(v1(`/vendors/${res.body.data._id}`))).body.data
        expect(vendor.userId._id).toBe(user)
        expect(vendor.stateId.stateName).toBe('Punjab')
        expect(vendor.cityId.cityName).toBe('Amritsar')
    })
})
