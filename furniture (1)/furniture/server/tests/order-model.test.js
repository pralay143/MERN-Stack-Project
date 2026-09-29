const mongoose = require('mongoose')
const db = require('./helpers/db')
const Order = require('../src/modules/order/order.model')

beforeAll(db.connect)
afterAll(db.close)

const address = { fullName: 'Asha', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' }
const item = { product: new mongoose.Types.ObjectId(), productName: 'Sofa', unitPrice: 100000, quantity: 2, lineTotal: 200000 }

test('order numbers look like EF-yymmdd-XXXXXX without look-alike characters', () => {
    const number = Order.newOrderNumber(new Date('2026-09-29T10:00:00Z'))
    expect(number).toMatch(/^EF-260929-[A-HJ-NP-Z2-9]{6}$/)
    const many = new Set(Array.from({ length: 500 }, () => Order.newOrderNumber()))
    expect(many.size).toBe(500)
})

test('a new order waits for payment and records status changes', async () => {
    const order = new Order({
        orderNumber: Order.newOrderNumber(),
        user: new mongoose.Types.ObjectId(),
        items: [item],
        subtotal: 200000,
        deliveryFee: 49900,
        total: 249900,
        address,
    })
    expect(order.status).toBe('pending_payment')
    expect(order.items[0].status).toBe('processing')
    order.setStatus('processing', 'Paid')
    await order.save()
    expect(order.statusHistory.map((h) => h.status)).toEqual(['processing'])
})

test('an order needs items and valid money amounts', async () => {
    const order = new Order({ orderNumber: 'EF-X', user: new mongoose.Types.ObjectId(), items: [], subtotal: 1.5, deliveryFee: 0, total: -1, address })
    const error = order.validateSync()
    expect(Object.keys(error.errors)).toEqual(expect.arrayContaining(['items', 'subtotal', 'total']))
})
