// GET /api/v1/checkout/summary and the order totals rule.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')
const { totalsFor } = require('../src/modules/checkout/checkout.service')
const { FREE_DELIVERY_FROM, DELIVERY_FEE } = require('../src/config/shop')

const v1 = (path) => `/api/v1${path}`
const address = { fullName: 'Asha Patel', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' }

describe('totalsFor', () => {
    test('charges delivery below the free-delivery amount', () => {
        expect(totalsFor(500000)).toEqual({
            subtotal: 500000,
            deliveryFee: DELIVERY_FEE,
            total: 500000 + DELIVERY_FEE,
            freeDeliveryFrom: FREE_DELIVERY_FROM,
            amountForFreeDelivery: FREE_DELIVERY_FROM - 500000,
        })
    })

    test('delivery is free from the threshold upwards', () => {
        expect(totalsFor(FREE_DELIVERY_FROM)).toMatchObject({ deliveryFee: 0, total: FREE_DELIVERY_FROM, amountForFreeDelivery: 0 })
    })

    test('an empty cart costs nothing', () => {
        expect(totalsFor(0)).toMatchObject({ deliveryFee: 0, total: 0 })
    })
})

describe('GET /checkout/summary', () => {
    let asha, lamp, sofa

    beforeAll(async () => {
        await db.connect()
        asha = await loginAs(app, 'Customer', 'asha@example.com')
        const categoryId = (await Category.create({ categoryName: 'Living' }))._id
        ;[lamp, sofa] = await Product.create([
            { productName: 'Lamp', price: 250000, stock: 5, categoryId },
            { productName: 'Sofa', price: 3000000, stock: 2, categoryId },
        ])
    })
    afterAll(db.close)

    const summary = async (query = '') => (await asha.get(v1(`/checkout/summary${query}`))).body.data

    test('an empty cart and no address can’t be ordered, with reasons', async () => {
        const data = await summary()
        expect(data.canPlaceOrder).toBe(false)
        expect(data.blockers).toEqual(['Your cart is empty', 'Add a delivery address'])
    })

    test('a small order pays delivery and needs an address', async () => {
        await asha.put(v1(`/cart/items/${lamp._id}`)).send({ quantity: 2 })
        const data = await summary()
        expect(data).toMatchObject({ itemCount: 2, subtotal: 500000, deliveryFee: DELIVERY_FEE, total: 500000 + DELIVERY_FEE })
        expect(data.blockers).toEqual(['Add a delivery address'])
    })

    test('with a default address and enough stock the order can be placed', async () => {
        await asha.post(v1('/addresses')).send(address)
        await asha.put(v1(`/cart/items/${sofa._id}`)).send({ quantity: 1 })
        const data = await summary()
        expect(data.canPlaceOrder).toBe(true)
        expect(data.blockers).toEqual([])
        expect(data.address.city).toBe('Ahmedabad')
        expect(data).toMatchObject({ subtotal: 3500000, deliveryFee: 0, total: 3500000 })
    })

    test('a chosen address is used instead of the default', async () => {
        const office = (await asha.post(v1('/addresses')).send({ ...address, city: 'Gandhinagar' })).body.data
        expect((await summary(`?addressId=${office._id}`)).address.city).toBe('Gandhinagar')
    })

    test('someone else’s address or a bad id is refused', async () => {
        const ravi = await loginAs(app, 'Customer', 'ravi@example.com')
        const ravis = (await ravi.post(v1('/addresses')).send(address)).body.data
        expect((await asha.get(v1(`/checkout/summary?addressId=${ravis._id}`))).status).toBe(404)
        expect((await asha.get(v1('/checkout/summary?addressId=abc'))).status).toBe(400)
        expect((await asha.get(v1(`/checkout/summary?addressId=${new mongoose.Types.ObjectId()}`))).status).toBe(404)
    })

    test('stock problems block the order', async () => {
        await Product.updateOne({ _id: sofa._id }, { stock: 0 })
        const data = await summary()
        expect(data.canPlaceOrder).toBe(false)
        expect(data.blockers[0]).toMatch(/sold out/)
    })

    test('needs a login', async () => {
        expect((await request(app).get(v1('/checkout/summary'))).status).toBe(401)
    })
})
