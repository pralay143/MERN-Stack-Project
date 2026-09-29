// POST /api/v1/payments/razorpay/webhook: signed by Razorpay, no login.
jest.mock('../src/services/razorpay', () => {
    const actual = jest.requireActual('../src/services/razorpay')
    let n = 0
    return { ...actual, isConfigured: () => true, createOrder: jest.fn(async ({ amount }) => ({ id: `order_w${++n}`, amount })) }
})

const crypto = require('crypto')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const config = require('../src/config/env')
const Category = require('../src/modules/category/category.model')
const Product = require('../src/modules/product/product.model')
const Order = require('../src/modules/order/order.model')

const URL = '/api/v1/payments/razorpay/webhook'
const address = { fullName: 'Asha', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' }

let asha, lamp, addressId

beforeAll(async () => {
    await db.connect()
    asha = await loginAs(app, 'Customer')
    const categoryId = (await Category.create({ categoryName: 'Living' }))._id
    lamp = await Product.create({ productName: 'Lamp', price: 250000, stock: 50, categoryId })
    addressId = (await asha.post('/api/v1/addresses').send(address)).body.data._id
})
afterAll(db.close)

async function unpaidOrder() {
    await asha.put(`/api/v1/cart/items/${lamp._id}`).send({ quantity: 1 })
    return (await asha.post('/api/v1/orders').send({ addressId })).body.data.order
}

const capturedEvent = (order, { paymentId = 'pay_hook', amount = order.total, event = 'payment.captured' } = {}) => ({
    event,
    payload: { payment: { entity: { id: paymentId, order_id: order.payment.razorpayOrderId, amount, currency: 'INR', status: 'captured' } } },
})

// Sends the body exactly as serialised, signed like Razorpay does.
function deliver(body, { secret = process.env.RAZORPAY_WEBHOOK_SECRET, signature } = {}) {
    const raw = JSON.stringify(body)
    const sig = signature ?? crypto.createHmac('sha256', secret).update(raw).digest('hex')
    return request(app).post(URL).set('Content-Type', 'application/json').set('X-Razorpay-Signature', sig).send(raw)
}

test('a genuine payment.captured marks the order paid', async () => {
    const order = await unpaidOrder()
    const res = await deliver(capturedEvent(order))
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true, handled: true })
    const stored = await Order.findById(order._id)
    expect(stored.status).toBe('processing')
    expect(stored.payment.razorpayPaymentId).toBe('pay_hook')
    expect(stored.statusHistory.at(-1).note).toBe('Payment confirmed by Razorpay')
})

test('the same event again (Razorpay retries) changes nothing', async () => {
    const order = await unpaidOrder()
    await deliver(capturedEvent(order, { paymentId: 'pay_twice' }))
    const res = await deliver(capturedEvent(order, { paymentId: 'pay_twice', event: 'order.paid' }))
    expect(res.body.handled).toBe(true)
    expect((await Order.findById(order._id)).statusHistory).toHaveLength(2)
})

test.each([
    ['signed with the wrong secret', { secret: 'not-the-secret' }],
    ['with a made-up signature', { signature: 'f'.repeat(64) }],
    ['without a signature', { signature: '' }],
])('an event %s is rejected and changes nothing', async (_, options) => {
    const order = await unpaidOrder()
    const res = await deliver(capturedEvent(order), options)
    expect(res.status).toBe(400)
    expect((await Order.findById(order._id)).status).toBe('pending_payment')
})

test('a body changed after signing is rejected', async () => {
    const order = await unpaidOrder()
    const body = capturedEvent(order)
    const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex')
    body.payload.payment.entity.amount = 1
    expect((await deliver(body, { signature: sig })).status).toBe(400)
})

test('a payment for the wrong amount doesn’t mark the order paid', async () => {
    const order = await unpaidOrder()
    const res = await deliver(capturedEvent(order, { amount: 100 }))
    expect(res.body).toEqual({ received: true, handled: false })
    expect((await Order.findById(order._id)).status).toBe('pending_payment')
})

test('other events and unknown orders are acknowledged and ignored', async () => {
    const order = await unpaidOrder()
    expect((await deliver(capturedEvent(order, { event: 'payment.failed' }))).body.handled).toBe(false)
    const unknown = { ...order, payment: { razorpayOrderId: 'order_unknown' } }
    expect((await deliver(capturedEvent(unknown))).body.handled).toBe(false)
    expect((await Order.findById(order._id)).status).toBe('pending_payment')
})

test('without a webhook secret configured, the endpoint refuses', async () => {
    const saved = config.razorpayWebhookSecret
    config.razorpayWebhookSecret = undefined
    try {
        const order = await unpaidOrder()
        expect((await deliver(capturedEvent(order))).status).toBe(503)
    } finally {
        config.razorpayWebhookSecret = saved
    }
})
