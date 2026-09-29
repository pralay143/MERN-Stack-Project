// Sellers fulfil their own items; admins see and manage every order.
jest.mock('../src/services/razorpay', () => {
    const actual = jest.requireActual('../src/services/razorpay')
    let n = 0
    return { ...actual, isConfigured: () => true, createOrder: jest.fn(async ({ amount }) => ({ id: `order_f${++n}`, amount })) }
})

const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')
const Order = require('../src/modules/order/order.model')
const orderService = require('../src/modules/order/order.service')
const { statusFromItems } = require('../src/modules/order/fulfilment.service')

const v1 = (path) => `/api/v1${path}`
const address = { fullName: 'Asha Patel', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' }

let admin, sellerA, sellerB, sellerC, asha, sofa, lamp, addressId

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
    sellerA = await loginAs(app, 'Vendor', 'a@example.com')
    sellerB = await loginAs(app, 'Vendor', 'b@example.com')
    sellerC = await loginAs(app, 'Vendor', 'c@example.com')
    asha = await loginAs(app, 'Customer', 'asha@example.com')
    const categoryId = (await Category.create({ categoryName: 'Living' }))._id
    ;[sofa, lamp] = await Product.create([
        { productName: 'Sofa', price: 3000000, stock: 10, categoryId, user: sellerA.user._id },
        { productName: 'Lamp', price: 250000, stock: 10, categoryId, user: sellerB.user._id },
    ])
    addressId = (await asha.post(v1('/addresses')).send(address)).body.data._id
})
afterAll(db.close)

// Places an order for a sofa and a lamp (two sellers), paid unless paid: false.
async function newOrder({ paid = true } = {}) {
    await asha.delete(v1('/cart'))
    await asha.put(v1(`/cart/items/${sofa._id}`)).send({ quantity: 1 })
    await asha.put(v1(`/cart/items/${lamp._id}`)).send({ quantity: 2 })
    const { order } = (await asha.post(v1('/orders')).send({ addressId })).body.data
    if (paid) await orderService.markPaid(order._id, `pay_${order._id}`, 'Payment confirmed')
    return order
}
const setItem = (agent, order, product, status) => agent.patch(v1(`/orders/${order._id}/items/${product._id}`)).send({ status })
const stockOf = async (product) => (await Product.findById(product._id)).stock

test('statusFromItems', () => {
    const items = (...s) => s.map((status) => ({ status }))
    expect(statusFromItems(items('processing', 'shipped'))).toBe('processing')
    expect(statusFromItems(items('shipped', 'delivered'))).toBe('shipped')
    expect(statusFromItems(items('delivered', 'delivered'))).toBe('delivered')
})

describe('what sellers see', () => {
    let paid, unpaid

    beforeAll(async () => {
        paid = await newOrder()
        unpaid = await newOrder({ paid: false })
    })

    test('only paid orders with their items, and only their own items and totals', async () => {
        const res = await sellerA.get(v1('/orders/sold'))
        expect(res.status).toBe(200)
        const ids = res.body.data.map((o) => o._id)
        expect(ids).toContain(paid._id)
        expect(ids).not.toContain(unpaid._id)

        const order = res.body.data.find((o) => o._id === paid._id)
        expect(order.items.map((i) => i.productName)).toEqual(['Sofa'])
        expect(order.sellerTotal).toBe(3000000)
        expect(order.total).toBeUndefined()
        expect(order.payment).toBeUndefined()
        expect(order.address.city).toBe('Ahmedabad') // needed to deliver
    })

    test('the same filtering applies when opening one order', async () => {
        const res = await sellerB.get(v1(`/orders/${paid._id}`))
        expect(res.status).toBe(200)
        expect(res.body.data.items.map((i) => i.productName)).toEqual(['Lamp'])
    })

    test('sellers with no items in an order, or an unpaid order, can’t open it', async () => {
        expect((await sellerC.get(v1(`/orders/${paid._id}`))).status).toBe(404)
        expect((await sellerA.get(v1(`/orders/${unpaid._id}`))).status).toBe(404)
    })

    test('the buyer and admins see the whole order', async () => {
        for (const agent of [asha, admin]) {
            const res = await agent.get(v1(`/orders/${paid._id}`))
            expect(res.body.data.items).toHaveLength(2)
            expect(res.body.data.total).toBe(paid.total)
        }
    })
})

describe('fulfilment', () => {
    let order

    beforeAll(async () => {
        order = await newOrder()
    })

    test('an item must ship before it can be delivered', async () => {
        const res = await setItem(sellerA, order, sofa, 'delivered')
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/can only be marked shipped next/)
    })

    test('sellers can’t touch other sellers’ items', async () => {
        expect((await setItem(sellerA, order, lamp, 'shipped')).status).toBe(404)
        expect((await setItem(sellerC, order, sofa, 'shipped')).status).toBe(404)
    })

    test('customers can’t update items', async () => {
        expect((await setItem(asha, order, sofa, 'shipped')).status).toBe(403)
    })

    test('the order ships when every item has shipped, and is delivered when every item is', async () => {
        let res = await setItem(sellerA, order, sofa, 'shipped')
        expect(res.status).toBe(200)
        expect(res.body.data.items[0]).toMatchObject({ status: 'shipped' })
        expect((await Order.findById(order._id)).status).toBe('processing')

        await setItem(sellerB, order, lamp, 'shipped')
        expect((await Order.findById(order._id)).status).toBe('shipped')

        await setItem(sellerA, order, sofa, 'delivered')
        expect((await Order.findById(order._id)).status).toBe('shipped')
        res = await setItem(sellerB, order, lamp, 'delivered')
        const stored = await Order.findById(order._id)
        expect(stored.status).toBe('delivered')
        expect(stored.items.every((i) => i.deliveredAt)).toBe(true)
        expect(stored.statusHistory.map((h) => h.status)).toEqual(['pending_payment', 'processing', 'shipped', 'delivered'])
    })

    test('delivered items can’t move again', async () => {
        const res = await setItem(sellerA, order, sofa, 'shipped')
        expect(res.status).toBe(409)
    })

    test('unpaid orders can’t be fulfilled', async () => {
        const unpaid = await newOrder({ paid: false })
        const res = await setItem(admin, unpaid, sofa, 'shipped')
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/hasn’t been paid/)
    })

    test('the status must be shipped or delivered', async () => {
        const res = await setItem(sellerA, order, sofa, 'lost')
        expect(res.status).toBe(400)
    })
})

describe('admins', () => {
    test('see every order, including unpaid ones, and can filter by status', async () => {
        const all = (await admin.get(v1('/orders/sold?limit=50'))).body.data
        expect(all.some((o) => o.status === 'pending_payment')).toBe(true)
        const delivered = (await admin.get(v1('/orders/sold?status=delivered'))).body.data
        expect(delivered.length).toBeGreaterThan(0)
        expect(delivered.every((o) => o.status === 'delivered')).toBe(true)
        expect(delivered[0].user.email).toBe('asha@example.com')
        expect((await admin.get(v1('/orders/sold?status=lost'))).status).toBe(400)
    })

    test('can cancel a paid order that hasn’t shipped; the stock goes back', async () => {
        const order = await newOrder()
        const before = { sofa: await stockOf(sofa), lamp: await stockOf(lamp) }
        const res = await admin.post(v1(`/orders/${order._id}/cancel`))
        expect(res.status).toBe(200)
        expect(res.body.data).toMatchObject({ status: 'cancelled', cancelReason: expect.stringMatching(/refund/) })
        expect(await stockOf(sofa)).toBe(before.sofa + 1)
        expect(await stockOf(lamp)).toBe(before.lamp + 2)
    })

    test('can’t cancel once something has shipped', async () => {
        const order = await newOrder()
        await setItem(sellerA, order, sofa, 'shipped')
        const res = await admin.post(v1(`/orders/${order._id}/cancel`))
        expect(res.status).toBe(409)
        expect((await Order.findById(order._id)).status).toBe('processing')
    })

    test('can cancel a customer’s unpaid order', async () => {
        const order = await newOrder({ paid: false })
        const res = await admin.post(v1(`/orders/${order._id}/cancel`))
        expect(res.status).toBe(200)
        expect(res.body.data.status).toBe('cancelled')
    })

    test('customers still can’t cancel paid orders', async () => {
        const order = await newOrder()
        expect((await asha.post(v1(`/orders/${order._id}/cancel`))).status).toBe(409)
    })
})

test('seller order lists need a seller or admin', async () => {
    expect((await asha.get(v1('/orders/sold'))).status).toBe(403)
    expect((await request(app).get(v1('/orders/sold'))).status).toBe(401)
})
