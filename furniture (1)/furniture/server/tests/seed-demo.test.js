const fs = require('fs')
const path = require('path')
const db = require('./helpers/db')
const { removeTestUploads } = require('./helpers/files')
const { seed } = require('../src/seed/seed')
const { seedDemo } = require('../src/seed/demo')
const { products: demoProducts } = require('../src/seed/demoData')
const Product = require('../src/modules/product/product.model')
const { uploadDir } = require('../src/config/env')

beforeAll(async () => {
    await db.connect()
    await seed({ adminPassword: 'Admin@12345' })
})
afterAll(async () => {
    removeTestUploads()
    await db.close()
})

test('adds every demo product with its brand, category and a stored image', async () => {
    const result = await seedDemo()
    expect(result.products).toBe(demoProducts.length)

    const products = await Product.find().populate('categoryId').populate('brandId')
    expect(products).toHaveLength(demoProducts.length)
    for (const p of products) {
        expect(Number.isInteger(p.price)).toBe(true)
        expect(p.categoryId.categoryName).toBeDefined()
        expect(p.brandId.brandName).toBeDefined()
        expect(p.file.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.(jpg|png)$/)
        expect(fs.existsSync(path.join(uploadDir, path.basename(p.file.url)))).toBe(true)
    }
})

test('running it again adds nothing and copies no more images', async () => {
    const filesBefore = fs.readdirSync(uploadDir).length
    expect((await seedDemo()).products).toBe(0)
    expect(await Product.countDocuments()).toBe(demoProducts.length)
    expect(fs.readdirSync(uploadDir).length).toBe(filesBefore)
})

test('needs the admin user from the normal seed', async () => {
    await expect(seedDemo({ ownerEmail: 'nobody@example.com' })).rejects.toThrow(/run the normal seed first/)
})
