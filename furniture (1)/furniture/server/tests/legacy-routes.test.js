// Contract tests for the routes the current CRA client calls.
// They check only what the client reads from each response, so they keep
// passing while the internals are rewritten.
const request = require('supertest')
const app = require('../app')
const db = require('./helpers/db')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')

const api = request(app)

let refs // ids of reference data created in beforeAll

async function createReferenceData() {
    const role = await api.post('/role/role').send({ name: 'Customer' })
    const category = await api.post('/category/category').send({ categoryName: 'Sofa', isActive: true })
    const brand = await api.post('/brand/brand').send({ brandName: 'Oakwood', categoryId: category.body.data._id })
    const state = await api.post('/state/state').send({ stateName: 'Gujarat' })
    const city = await api.post('/city/city').send({ cityName: 'Ahmedabad', state: state.body.data._id })
    return {
        roleId: role.body.data._id,
        categoryId: category.body.data._id,
        brandId: brand.body.data._id,
        stateId: state.body.data._id,
        cityId: city.body.data._id,
    }
}

const newUser = (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Secret@123',
    gender: 'MALE',
    contactNum: '9999999999',
    role: refs.roleId,
    ...overrides,
})

beforeAll(async () => {
    await db.connect()
    refs = await createReferenceData()
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

describe('users (/user/user)', () => {
    let userId

    test('POST registers a user', async () => {
        const res = await api.post('/user/user').send(newUser())
        expect(res.status).toBe(200)
        expect(res.body.data._id).toBeDefined()
        expect(res.body.data.email).toBe('test@example.com')
        userId = res.body.data._id
    })

    test('POST /login returns the user with a populated role', async () => {
        const res = await api.post('/user/user/login').send({ email: 'test@example.com', password: 'Secret@123' })
        expect(res.status).toBe(200)
        expect(res.body.data[0]._id).toBe(userId)
        expect(res.body.data[0].role.name).toBe('Customer')
    })

    test('POST /login rejects a wrong password', async () => {
        const res = await api.post('/user/user/login').send({ email: 'test@example.com', password: 'wrong' })
        expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('POST /login rejects missing fields', async () => {
        const res = await api.post('/user/user/login').send({ email: 'test@example.com' })
        expect(res.status).toBeGreaterThanOrEqual(400)
    })

    test('GET lists users with populated roles', async () => {
        const res = await api.get('/user/user')
        expect(res.status).toBe(200)
        const user = res.body.data.find((u) => u._id === userId)
        expect(user.name).toBe('Test User')
        expect(user.role.name).toBe('Customer')
    })

    test('GET /:id returns one user', async () => {
        const res = await api.get(`/user/user/${userId}`)
        expect(res.status).toBe(200)
        expect(res.body.data.name).toBe('Test User')
    })

    test('DELETE /:id removes the user', async () => {
        const res = await api.delete(`/user/user/${userId}`)
        expect(res.status).toBe(200)
        const list = await api.get('/user/user')
        expect(list.body.data.some((u) => u._id === userId)).toBe(false)
    })
})

describe('reference data lists', () => {
    test('GET /category/category', async () => {
        const res = await api.get('/category/category')
        expect(res.status).toBe(200)
        expect(res.body.data[0].categoryName).toBe('Sofa')
    })

    test('GET /brand/brand populates the category', async () => {
        const res = await api.get('/brand/brand')
        expect(res.status).toBe(200)
        expect(res.body.data[0].brandName).toBe('Oakwood')
        expect(res.body.data[0].categoryId.categoryName).toBe('Sofa')
    })

    test('GET /state/state', async () => {
        const res = await api.get('/state/state')
        expect(res.status).toBe(200)
        expect(res.body.data[0].stateName).toBe('Gujarat')
    })

    test('GET /city/city populates the state', async () => {
        const res = await api.get('/city/city')
        expect(res.status).toBe(200)
        expect(res.body.data[0].cityName).toBe('Ahmedabad')
        expect(res.body.data[0].state.stateName).toBe('Gujarat')
    })

    test('GET /role/role', async () => {
        const res = await api.get('/role/role')
        expect(res.status).toBe(200)
        expect(res.body.data.map((r) => r.name)).toContain('Customer')
    })
})

describe('products (/product/product)', () => {
    let productId

    test('POST adds a product with an image (multipart form)', async () => {
        const res = await api
            .post('/product/product')
            .field('productName', 'Chesterfield Sofa')
            .field('categoryId', refs.categoryId)
            .field('brandId', refs.brandId)
            .field('basePrice', '25500')
            .field('qty', '3')
            .field('description', 'Three-seater')
            .attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(200)
    })

    test('GET lists products under "products" with category, brand and price', async () => {
        const res = await api.get('/product/product')
        expect(res.status).toBe(200)
        const product = res.body.products.find((p) => p.productName === 'Chesterfield Sofa')
        expect(product).toBeDefined()
        expect(product.categoryId.categoryName).toBe('Sofa')
        expect(product.brandId.brandName).toBe('Oakwood')
        expect(Number(product.basePrice)).toBe(25500) // rupees, as the client displays it
        expect(product.file.url).toMatch(/^\/uploads\/.+/)
        productId = product._id
    })

    test('DELETE /:id removes the product', async () => {
        const res = await api.delete(`/product/product/${productId}`)
        expect(res.status).toBe(200)
        const list = await api.get('/product/product')
        expect(list.body.products.some((p) => p._id === productId)).toBe(false)
    })
})

describe('vendors (/vendor/vendor)', () => {
    let vendorId

    test('POST adds vendor details', async () => {
        const res = await api.post('/vendor/vendor').send({
            vendorName: 'Oakwood Interiors',
            address: '12 CG Road',
            pincode: '380009',
            contactNum: '8888888888',
        })
        expect(res.status).toBe(200)
        expect(res.body.data._id).toBeDefined()
        vendorId = res.body.data._id
    })

    test('GET lists vendors', async () => {
        const res = await api.get('/vendor/vendor')
        expect(res.status).toBe(200)
        expect(res.body.data.find((v) => v._id === vendorId).vendorName).toBe('Oakwood Interiors')
    })

    test('DELETE /:id removes the vendor', async () => {
        const res = await api.delete(`/vendor/vendor/${vendorId}`)
        expect(res.status).toBe(200)
        const list = await api.get('/vendor/vendor')
        expect(list.body.data.some((v) => v._id === vendorId)).toBe(false)
    })
})

describe('other legacy routes', () => {
    test('POST /vproduct/add links a product to a vendor', async () => {
        const res = await api.post('/vproduct/add').send({ qty: 2 })
        expect(res.status).toBe(200)
    })

    test('POST /upload/upload stores a file', async () => {
        const res = await api.post('/upload/upload').attach('file', PNG_1PX, TEST_IMAGE_NAME)
        expect(res.status).toBe(200)
    })
})
