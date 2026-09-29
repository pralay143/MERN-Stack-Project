// Product stock: set when creating/updating, validated, and seeded for demos.
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')

const v1 = (path) => `/api/v1${path}`
let vendor, categoryId

beforeAll(async () => {
    await db.connect()
    vendor = await loginAs(app, 'Vendor')
    categoryId = (await Category.create({ categoryName: 'Stools' }))._id.toString()
})
afterAll(async () => {
    removeTestUploads()
    await db.close()
})

const addProduct = (fields, path = v1('/products')) => {
    const req = vendor.post(path)
    for (const [k, v] of Object.entries({ productName: 'Bar Stool', categoryId, price: '450000', ...fields })) req.field(k, v)
    return req.attach('file', PNG_1PX, TEST_IMAGE_NAME)
}

test('stock is saved when a product is created', async () => {
    const res = await addProduct({ stock: '12' })
    expect(res.status).toBe(201)
    expect(res.body.data.stock).toBe(12)
})

test('stock defaults to 0 when left out', async () => {
    const res = await addProduct({})
    expect(res.body.data.stock).toBe(0)
})

test.each([
    ['-1', 'Stock cannot be negative'],
    ['2.5', 'Stock must be a whole number'],
    ['lots', 'Stock must be a number'],
    ['100001', 'Stock must be at most 100000'],
])('stock %s is rejected', async (stock, message) => {
    const res = await addProduct({ stock })
    expect(res.status).toBe(400)
    expect(res.body.errors.stock).toBe(message)
})

test('stock can be updated', async () => {
    const id = (await addProduct({ stock: '3' })).body.data._id
    const res = await vendor.patch(v1(`/products/${id}`)).send({ stock: 7 })
    expect(res.status).toBe(200)
    expect(res.body.data.stock).toBe(7)
})

test('the legacy product form’s qty field sets the stock', async () => {
    const admin = await loginAs(app, 'Admin')
    const req = admin.post('/product/product')
    for (const [k, v] of Object.entries({ productName: 'Legacy Stool', categoryId, basePrice: '4500', qty: '4' })) req.field(k, v)
    const res = await req.attach('file', PNG_1PX, TEST_IMAGE_NAME)
    expect(res.status).toBe(201)
    expect(res.body.data.stock).toBe(4)
})

test('products stored without a stock field read as 0', async () => {
    const { insertedId } = await Product.collection.insertOne({ productName: 'Old', price: 100, categoryId })
    expect((await Product.findById(insertedId)).stock).toBe(0)
})
