// Rules checked inside controllers: users act on their own account, vendors
// on their own products and profile; admins on anything.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads } = require('./helpers/files')

const v1 = (path) => `/api/v1${path}`

let admin, vendorA, vendorB, customer, other, categoryId

beforeAll(async () => {
    await db.connect()
    admin = await loginAs(app, 'Admin')
    vendorA = await loginAs(app, 'Vendor', 'vendor-a@example.com')
    vendorB = await loginAs(app, 'Vendor', 'vendor-b@example.com')
    customer = await loginAs(app, 'Customer')
    other = await loginAs(app, 'Customer', 'other@example.com')
    categoryId = (await admin.post(v1('/categories')).send({ categoryName: 'Beds' })).body.data._id
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

const idOf = (agent) => agent.user._id.toString()
const anyId = () => new mongoose.Types.ObjectId().toString()

describe('users', () => {
    test('can read their own account but not someone else’s', async () => {
        expect((await customer.get(v1(`/users/${idOf(customer)}`))).status).toBe(200)
        expect((await customer.get(v1(`/users/${idOf(other)}`))).status).toBe(403)
        expect((await admin.get(v1(`/users/${idOf(customer)}`))).status).toBe(200)
    })

    test('can update their own details', async () => {
        const res = await customer.patch(v1(`/users/${idOf(customer)}`)).send({ name: 'Renamed' })
        expect(res.status).toBe(200)
        expect(res.body.data.name).toBe('Renamed')
        expect((await customer.patch(v1(`/users/${idOf(other)}`)).send({ name: 'Hacked' })).status).toBe(403)
    })

    test('cannot change their own role; an admin can', async () => {
        const adminRole = '646afa55a201bba44448c941'
        const vendorRole = '646afa4fa201bba44448c943'
        expect((await customer.patch(v1(`/users/${idOf(customer)}`)).send({ role: adminRole })).status).toBe(403)

        const promoted = await admin.patch(v1(`/users/${idOf(other)}`)).send({ role: vendorRole })
        expect(promoted.status).toBe(200)
        // The new role applies on the next request.
        expect((await other.get(v1('/auth/me'))).body.data.role.name).toBe('Vendor')
    })
})

describe('products', () => {
    let productId

    const addProduct = (agent, extra = {}) => {
        const req = agent.post(v1('/products'))
        for (const [k, v] of Object.entries({ productName: 'Queen Bed', categoryId, price: '3500000', ...extra })) req.field(k, v)
        return req.attach('file', PNG_1PX, TEST_IMAGE_NAME)
    }

    test('belong to the vendor who creates them, whatever the body says', async () => {
        const res = await addProduct(vendorA, { user: idOf(vendorB) })
        expect(res.status).toBe(201)
        expect(res.body.data.user).toBe(idOf(vendorA))
        productId = res.body.data._id
    })

    test('another vendor cannot update or delete them', async () => {
        expect((await vendorB.patch(v1(`/products/${productId}`)).send({ productName: 'Mine now' })).status).toBe(403)
        expect((await vendorB.delete(v1(`/products/${productId}`))).status).toBe(403)
        expect((await vendorB.delete(`/product/product/${productId}`)).status).toBe(403) // legacy URL too
    })

    test('the owner can update them but not hand them to someone else', async () => {
        const res = await vendorA.patch(v1(`/products/${productId}`)).send({ productName: 'King Bed', user: idOf(vendorB) })
        expect(res.status).toBe(200)
        expect(res.body.data.productName).toBe('King Bed')
        expect(res.body.data.user).toBe(idOf(vendorA))
    })

    test('an admin can delete any product', async () => {
        expect((await admin.delete(v1(`/products/${productId}`))).status).toBe(200)
    })
})

describe('vendor profiles', () => {
    let profileId

    test('a vendor’s profile is always linked to their own account', async () => {
        const res = await vendorA.post(v1('/vendors')).send({ vendorName: 'A Furnishings', userId: idOf(vendorB) })
        expect(res.status).toBe(201)
        expect(res.body.data.userId).toBe(idOf(vendorA))
        profileId = res.body.data._id
    })

    test('only the owner or an admin can read or update it', async () => {
        expect((await vendorA.get(v1(`/vendors/${profileId}`))).status).toBe(200)
        expect((await vendorB.get(v1(`/vendors/${profileId}`))).status).toBe(403)
        expect((await vendorB.patch(v1(`/vendors/${profileId}`)).send({ vendorName: 'B' })).status).toBe(403)
        expect((await admin.get(v1(`/vendors/${profileId}`))).status).toBe(200)
    })

    test('an admin can create a profile for another user', async () => {
        const res = await admin.post(v1('/vendors')).send({ vendorName: 'B Woods', userId: idOf(vendorB) })
        expect(res.status).toBe(201)
        expect(res.body.data.userId).toBe(idOf(vendorB))
    })
})

describe('vendor products', () => {
    test('need the vendor’s own profile', async () => {
        const noProfile = await loginAs(app, 'Vendor', 'no-profile@example.com')
        const res = await noProfile.post(v1('/vendor-products')).send({ productId: anyId(), quantity: 1 })
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/vendor profile/)
    })

    test('are always added to the vendor’s own profile', async () => {
        const bProfile = (await admin.get(v1('/vendors'))).body.data.find((v) => v.vendorName === 'B Woods')
        const res = await vendorA.post(v1('/vendor-products')).send({ productId: anyId(), quantity: 3, vendorId: bProfile._id })
        expect(res.status).toBe(201)
        const aProfile = (await admin.get(v1('/vendors'))).body.data.find((v) => v.vendorName === 'A Furnishings')
        expect(res.body.data.vendorId).toBe(aProfile._id)
    })
})

test('requests from anonymous users never reach the upload step', async () => {
    const res = await request(app).post(v1('/products')).attach('file', PNG_1PX, TEST_IMAGE_NAME)
    expect(res.status).toBe(401)
})
