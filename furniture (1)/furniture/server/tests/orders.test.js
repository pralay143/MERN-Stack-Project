// Placing orders, paying with Razorpay, cancelling and expiring unpaid orders.
// Razorpay's API is mocked; signatures are checked for real with the test secret.
jest.mock('../src/services/razorpay', () => {
    const actual = jest.requireActual('../src/services/razorpay')
    return { ...actual, isConfigured: jest.fn(() => true), createOrder: jest.fn() }
})

const crypto = require('crypto')
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const razorpay = require('../src/services/razorpay')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')
const Order = require('../src/modules/order/order.model')
const Cart = require('../src/modules/cart/cart.model')
const orderService = require('../src/modules/order/order.service')
const { DELIVERY_FEE } = require('../src/config/shop')

const v1 = (path) => `/api/v1${path}`
const address = { fullName: 'Asha Patel', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' }
const sign = (orderId, paymentId) =>
    crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex')

let asha, ravi, vendor, lamp, chair, addressId
let rzpCounter = 0

beforeAll(async () => {
    await db.connect()
    vendor = await loginAs(app, 'Vendor', 'seller@example.com')
    asha = await loginAs(app, 'Customer', 'asha@example.com')
    ravi = await loginAs(app, 'Customer', 'ravi@example.com')
    const categoryId = (await Category.create({ categoryName: 'Living' }))._id
    ;[lamp, chair] = await Product.create([
        { productName: 'Lamp', price: 250000, stock: 5, categoryId, user: vendor.user._id, file: { url: '/uploads/lamp.jpg' } },
        { productName: 'Chair', price: 900000, stock: 1, categoryId, user: vendor.user._id },
    ])
    addressId = (await asha.post(v1('/addresses')).send(address)).body.data._id
})
afterAll(db.close)

beforeEach(() => {
    razorpay.createOrder.mockImplementation(async ({ amount }) => ({ id: `order_rzp${++rzpCounter}`, amount, currency: 'INR' }))
})

const stockOf = async (product) => (await Product.findById(product._id)).stock
const fillCart = async (agent, lines) => {
    await agent.delete(v1('/cart'))
    for (const [product, quantity] of lines) await agent.put(v1(`/cart/items/${product._id}`)).send({ quantity })
}
// createdAt can't be changed through Mongoose, so go to the collection directly.
const backdate = (order, minutes) =>
    Order.collection.updateOne({ _id: new mongoose.Types.ObjectId(order._id) }, { $set: { createdAt: new Date(Date.now() - minutes * 60_000) } })
const place = (agent = asha, id = addressId) => agent.post(v1('/orders')).send({ addressId: id })
const verify = (agent, order, paymentId, signature = sign(order.payment.razorpayOrderId, paymentId)) =>
    agent.post(v1(`/orders/${order._id}/verify`)).send({
        razorpay_order_id: order.payment.razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
    })

describe('placing an order', () => {
    test('reserves stock, snapshots items and address, and returns Razorpay options for the server total', async () => {
        await fillCart(asha, [[lamp, 2]])
        const res = await place()
        expect(res.status).toBe(201)
        const { order, payment } = res.body.data

        expect(order).toMatchObject({ status: 'pending_payment', subtotal: 500000, deliveryFee: DELIVERY_FEE, total: 500000 + DELIVERY_FEE })
        expect(order.orderNumber).toMatch(/^EF-\d{6}-[A-Z2-9]{6}$/)
        expect(order.items[0]).toMatchObject({ productName: 'Lamp', unitPrice: 250000, quantity: 2, lineTotal: 500000, imageUrl: '/uploads/lamp.jpg' })
        expect(order.items[0].seller).toBe(vendor.user._id.toString())
        expect(order.address).toMatchObject({ city: 'Ahmedabad', pincode: '380009' })

        expect(payment).toMatchObject({ razorpayOrderId: order.payment.razorpayOrderId, amount: order.total, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID })
        expect(payment.prefill).toMatchObject({ email: 'asha@example.com', contact: '+919876543210' })
        expect(razorpay.createOrder).toHaveBeenLastCalledWith(expect.objectContaining({ amount: order.total, receipt: order.orderNumber }))

        expect(await stockOf(lamp)).toBe(3)
        // The cart is only cleared once payment is confirmed.
        expect((await asha.get(v1('/cart'))).body.data.items).toHaveLength(1)
    })

    test('an order can’t be placed from an empty cart or without a valid address', async () => {
        await asha.delete(v1('/cart'))
        const empty = await place()
        expect(empty.status).toBe(400)
        expect(empty.body.message).toMatch(/cart is empty/)

        await fillCart(asha, [[lamp, 1]])
        expect((await place(asha, 'abc')).status).toBe(400)
        expect((await place(asha, new mongoose.Types.ObjectId().toString())).status).toBe(404)
    })

    test('someone else’s address can’t be used', async () => {
        await fillCart(ravi, [[lamp, 1]])
        expect((await place(ravi, addressId)).status).toBe(404)
    })

    test('if Razorpay fails, the stock is put back and no order is left behind', async () => {
        await fillCart(asha, [[lamp, 1]])
        const before = await stockOf(lamp)
        const orders = await Order.countDocuments()
        razorpay.createOrder.mockRejectedValueOnce(new razorpay.RazorpayError('down'))
        const res = await place()
        expect(res.status).toBe(502)
        expect(res.body.message).toMatch(/couldn’t start the payment/)
        expect(await stockOf(lamp)).toBe(before)
        expect(await Order.countDocuments()).toBe(orders)
    })

    test('two buyers can’t both get the last one', async () => {
        const ravisAddress = (await ravi.post(v1('/addresses')).send(address)).body.data._id
        await fillCart(asha, [[chair, 1]])
        await fillCart(ravi, [[chair, 1]])
        const [first, second] = await Promise.all([place(asha), place(ravi, ravisAddress)])
        expect([first.status, second.status].sort()).toEqual([201, 409])
        expect(await stockOf(chair)).toBe(0)
        const loser = first.status === 409 ? first : second
        expect(loser.body.message).toMatch(/Chair has just sold out/)
    })

    test('payments not configured gives 503', async () => {
        razorpay.isConfigured.mockReturnValueOnce(false)
        expect((await place()).status).toBe(503)
    })
})

describe('confirming payment', () => {
    let order

    beforeAll(async () => {
        await Product.updateOne({ _id: lamp._id }, { stock: 5 })
        await fillCart(asha, [[lamp, 1]])
        order = (await place()).body.data.order
    })

    test('a forged signature is rejected and the order stays unpaid', async () => {
        const res = await verify(asha, order, 'pay_1', 'f'.repeat(64))
        expect(res.status).toBe(400)
        expect((await Order.findById(order._id)).status).toBe('pending_payment')
    })

    test('a Razorpay order id from another order is rejected', async () => {
        const res = await asha.post(v1(`/orders/${order._id}/verify`)).send({
            razorpay_order_id: 'order_other',
            razorpay_payment_id: 'pay_1',
            razorpay_signature: sign('order_other', 'pay_1'),
        })
        expect(res.status).toBe(400)
    })

    test('another customer can’t confirm (or see) this order', async () => {
        expect((await verify(ravi, order, 'pay_1')).status).toBe(404)
        expect((await ravi.get(v1(`/orders/${order._id}`))).status).toBe(404)
    })

    test('a genuine signature marks it paid and clears those items from the cart', async () => {
        const res = await verify(asha, order, 'pay_1')
        expect(res.status).toBe(200)
        expect(res.body.data).toMatchObject({ status: 'processing', payment: { razorpayPaymentId: 'pay_1' } })
        expect(res.body.data.statusHistory.map((h) => h.status)).toEqual(['pending_payment', 'processing'])
        expect((await asha.get(v1('/cart'))).body.data.items).toHaveLength(0)
    })

    test('confirming the same payment again is harmless', async () => {
        const res = await verify(asha, order, 'pay_1')
        expect(res.status).toBe(200)
        expect(res.body.data.statusHistory).toHaveLength(2)
    })

    test('a different payment for an already paid order is refused', async () => {
        expect((await verify(asha, order, 'pay_2')).status).toBe(409)
    })

    test('paid orders can’t be paid again or cancelled by the customer', async () => {
        expect((await asha.post(v1(`/orders/${order._id}/pay`))).status).toBe(409)
        expect((await asha.post(v1(`/orders/${order._id}/cancel`))).status).toBe(409)
    })
})

describe('unpaid orders', () => {
    test('can be paid later with the same Razorpay order', async () => {
        await Product.updateOne({ _id: lamp._id }, { stock: 5 })
        await fillCart(asha, [[lamp, 1]])
        const order = (await place()).body.data.order
        const res = await asha.post(v1(`/orders/${order._id}/pay`))
        expect(res.status).toBe(200)
        expect(res.body.data.payment.razorpayOrderId).toBe(order.payment.razorpayOrderId)
    })

    test('can be cancelled by the customer, putting the stock back once', async () => {
        await Product.updateOne({ _id: lamp._id }, { stock: 5 })
        await fillCart(asha, [[lamp, 2]])
        const order = (await place()).body.data.order
        expect(await stockOf(lamp)).toBe(3)

        const res = await asha.post(v1(`/orders/${order._id}/cancel`))
        expect(res.status).toBe(200)
        expect(res.body.data).toMatchObject({ status: 'cancelled', cancelReason: 'Cancelled by the customer' })
        expect(await stockOf(lamp)).toBe(5)

        expect((await asha.post(v1(`/orders/${order._id}/cancel`))).status).toBe(409)
        await orderService.releaseStock(order._id)
        expect(await stockOf(lamp)).toBe(5)
    })

    test('expire after the payment window and release their stock', async () => {
        await Product.updateOne({ _id: lamp._id }, { stock: 5 })
        await fillCart(asha, [[lamp, 1]])
        const order = (await place()).body.data.order
        await backdate(order, 31)

        const res = await asha.get(v1(`/orders`))
        const listed = res.body.data.find((o) => o._id === order._id)
        expect(listed).toMatchObject({ status: 'cancelled', cancelReason: 'Payment not completed in time' })
        expect(await stockOf(lamp)).toBe(5)
        expect((await asha.post(v1(`/orders/${order._id}/pay`))).status).toBe(409)
    })

    test('a payment arriving after expiry takes the stock again if it’s still there', async () => {
        await Product.updateOne({ _id: lamp._id }, { stock: 5 })
        await fillCart(asha, [[lamp, 1]])
        const order = (await place()).body.data.order
        await backdate(order, 31)
        await orderService.expireUnpaid()
        expect(await stockOf(lamp)).toBe(5)

        const res = await verify(asha, order, 'pay_late')
        expect(res.status).toBe(200)
        expect(res.body.data.status).toBe('processing')
        expect(await stockOf(lamp)).toBe(4)
    })

    test('a payment arriving after expiry when the item sold out is flagged for refund', async () => {
        await Product.updateOne({ _id: chair._id }, { stock: 1 })
        await fillCart(asha, [[chair, 1]])
        const order = (await place()).body.data.order
        await asha.post(v1(`/orders/${order._id}/cancel`))
        await Product.updateOne({ _id: chair._id }, { stock: 0 }) // someone else bought it

        const res = await verify(asha, order, 'pay_too_late')
        expect(res.status).toBe(409)
        expect(res.body.message).toMatch(/will be refunded/)
        const stored = await Order.findById(order._id)
        expect(stored.status).toBe('cancelled')
        expect(stored.cancelReason).toMatch(/refund required/)
        expect(stored.payment.razorpayPaymentId).toBe('pay_too_late')
    })
})

describe('reading orders', () => {
    test('customers list only their own orders, newest first, with paging', async () => {
        const res = await asha.get(v1('/orders?limit=2'))
        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(2)
        expect(res.body.meta.total).toBeGreaterThan(2)
        const dates = res.body.data.map((o) => o.createdAt)
        expect([...dates].sort().reverse()).toEqual(dates)
        const ravis = (await ravi.get(v1('/orders'))).body.data
        expect(ravis.every((o) => o.user === ravi.user._id.toString())).toBe(true)
    })

    test('orders need a login', async () => {
        expect((await request(app).get(v1('/orders'))).status).toBe(401)
        expect((await request(app).post(v1('/orders')).send({ addressId })).status).toBe(401)
    })
})

test('the cart keeps other items when an order is paid', async () => {
    await Product.updateOne({ _id: lamp._id }, { stock: 5 })
    await fillCart(asha, [[lamp, 1]])
    const order = (await place()).body.data.order
    await Cart.updateOne({ user: asha.user._id }, { $push: { items: { product: chair._id, quantity: 1 } } })
    await verify(asha, order, `pay_keep_${Date.now()}`)
    const cart = await Cart.findOne({ user: asha.user._id })
    expect(cart.items.map((i) => i.product.toString())).toEqual([chair._id.toString()])
})
