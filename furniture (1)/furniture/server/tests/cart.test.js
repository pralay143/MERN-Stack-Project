// /api/v1/cart: one cart per user, limited by stock and the per-item cap.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { expectNoPassword } = require('./helpers/noPassword')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')
const { MAX_QUANTITY_PER_ITEM } = require('../src/config/shop')

const v1 = (path) => `/api/v1${path}`
let asha, ravi, sofa, lamp, soldOut

beforeAll(async () => {
    await db.connect()
    asha = await loginAs(app, 'Customer', 'asha@example.com')
    ravi = await loginAs(app, 'Customer', 'ravi@example.com')
    const categoryId = (await Category.create({ categoryName: 'Living' }))._id
    ;[sofa, lamp, soldOut] = await Product.create([
        { productName: 'Sofa', price: 3000000, stock: 3, categoryId },
        { productName: 'Lamp', price: 250000, stock: 50, categoryId },
        { productName: 'Gone Chair', price: 900000, stock: 0, categoryId },
    ])
})
afterAll(db.close)

const setQty = (agent, product, quantity) => agent.put(v1(`/cart/items/${product._id}`)).send({ quantity })

test('a new user has an empty cart', async () => {
    const res = await asha.get(v1('/cart'))
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ items: [], itemCount: 0, subtotal: 0, hasProblems: false })
})

test('adding items returns the cart with current prices and totals', async () => {
    await setQty(asha, sofa, 2)
    const res = await setQty(asha, lamp, 4)
    expect(res.status).toBe(200)
    const cart = res.body.data
    expect(cart.items.map((i) => [i.product.productName, i.quantity, i.lineTotal])).toEqual([
        ['Sofa', 2, 6000000],
        ['Lamp', 4, 1000000],
    ])
    expect(cart.itemCount).toBe(6)
    expect(cart.subtotal).toBe(7000000)
    expectNoPassword(res)
})

test('setting the quantity again replaces it instead of adding', async () => {
    const res = await setQty(asha, lamp, 1)
    expect(res.body.data.items.find((i) => i.product.productName === 'Lamp').quantity).toBe(1)
})

test('quantities above the stock are refused with the amount left', async () => {
    const res = await setQty(asha, sofa, 4)
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Only 3 left of Sofa')
})

test('sold-out products cannot be added', async () => {
    const res = await setQty(asha, soldOut, 1)
    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Gone Chair is out of stock')
})

test.each([
    [0, 'Quantity must be at least 1'],
    [1.5, 'Quantity must be a whole number'],
    [MAX_QUANTITY_PER_ITEM + 1, `You can buy up to ${MAX_QUANTITY_PER_ITEM} of one product`],
])('quantity %s is rejected', async (quantity, message) => {
    const res = await setQty(asha, lamp, quantity)
    expect(res.status).toBe(400)
    expect(res.body.errors.quantity).toBe(message)
})

test('unknown and malformed product ids', async () => {
    expect((await setQty(asha, { _id: new mongoose.Types.ObjectId() }, 1)).status).toBe(404)
    expect((await setQty(asha, { _id: 'abc' }, 1)).status).toBe(400)
})

test('each user sees only their own cart', async () => {
    await setQty(ravi, lamp, 2)
    const ashas = (await asha.get(v1('/cart'))).body.data
    const ravis = (await ravi.get(v1('/cart'))).body.data
    expect(ashas.items).toHaveLength(2)
    expect(ravis.items.map((i) => i.product.productName)).toEqual(['Lamp'])
})

test('stock falling below the cart quantity is flagged, not silently changed', async () => {
    await Product.updateOne({ _id: sofa._id }, { stock: 1 })
    const cart = (await asha.get(v1('/cart'))).body.data
    expect(cart.items.find((i) => i.product.productName === 'Sofa')).toMatchObject({ quantity: 2, problem: 'not_enough_stock' })
    expect(cart.hasProblems).toBe(true)

    await Product.updateOne({ _id: sofa._id }, { stock: 0 })
    expect((await asha.get(v1('/cart'))).body.data.items[0].problem).toBe('out_of_stock')
    await Product.updateOne({ _id: sofa._id }, { stock: 3 })
})

test('price changes show up in the cart straight away', async () => {
    await Product.updateOne({ _id: lamp._id }, { price: 300000 })
    const cart = (await asha.get(v1('/cart'))).body.data
    expect(cart.items.find((i) => i.product.productName === 'Lamp').lineTotal).toBe(300000)
})

test('lines for deleted products disappear', async () => {
    const categoryId = sofa.categoryId
    const temp = await Product.create({ productName: 'Temp', price: 100, stock: 5, categoryId })
    await setQty(asha, temp, 1)
    await Product.deleteOne({ _id: temp._id })
    const cart = (await asha.get(v1('/cart'))).body.data
    expect(cart.items.map((i) => i.product.productName)).not.toContain('Temp')
})

test('removing a line and emptying the cart', async () => {
    const removed = await asha.delete(v1(`/cart/items/${lamp._id}`))
    expect(removed.body.data.items.map((i) => i.product.productName)).toEqual(['Sofa'])
    const emptied = await asha.delete(v1('/cart'))
    expect(emptied.body.data.items).toEqual([])
})

describe('merging a visitor’s browser cart after login', () => {
    test('adds quantities, capped by stock and the per-item limit, skipping unusable products', async () => {
        await setQty(asha, lamp, 9)
        const res = await asha.post(v1('/cart/merge')).send({
            items: [
                { productId: lamp._id.toString(), quantity: 5 }, // 9 + 5, capped at 10
                { productId: sofa._id.toString(), quantity: 10 }, // capped at stock 3
                { productId: soldOut._id.toString(), quantity: 1 }, // skipped
                { productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }, // skipped
            ],
        })
        expect(res.status).toBe(200)
        const quantities = Object.fromEntries(res.body.data.items.map((i) => [i.product.productName, i.quantity]))
        expect(quantities).toEqual({ Lamp: MAX_QUANTITY_PER_ITEM, Sofa: 3 })
    })

    test('rejects malformed items', async () => {
        const res = await asha.post(v1('/cart/merge')).send({ items: [{ productId: 'abc', quantity: 1 }] })
        expect(res.status).toBe(400)
    })
})

test('the cart needs a login', async () => {
    expect((await request(app).get(v1('/cart'))).status).toBe(401)
})
