// /api/v1/addresses: a user's own delivery addresses, with one default.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { MAX_ADDRESSES } = require('../src/modules/address/address.service')

const v1 = (path) => `/api/v1${path}`
let asha, ravi

const home = {
    fullName: 'Asha Patel',
    phone: '+91 98765-43210',
    line1: '12, Shanti Nagar',
    line2: 'Near City Mall',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
}

beforeAll(async () => {
    await db.connect()
    asha = await loginAs(app, 'Customer', 'asha@example.com')
    ravi = await loginAs(app, 'Customer', 'ravi@example.com')
})
afterAll(db.close)

const add = (agent, overrides = {}) => agent.post(v1('/addresses')).send({ ...home, ...overrides })
const listOf = async (agent) => (await agent.get(v1('/addresses'))).body.data

describe('adding addresses', () => {
    test('the first address becomes the default; the phone is stored as 10 digits', async () => {
        const res = await add(asha)
        expect(res.status).toBe(201)
        expect(res.body.data).toMatchObject({ fullName: 'Asha Patel', phone: '9876543210', isDefault: true })
    })

    test('later addresses are not the default unless asked', async () => {
        const office = await add(asha, { line1: 'Office, CG Road' })
        expect(office.body.data.isDefault).toBe(false)
        const parents = await add(asha, { line1: 'Parents, Satellite', isDefault: true })
        expect(parents.body.data.isDefault).toBe(true)

        const list = await listOf(asha)
        expect(list.filter((a) => a.isDefault).map((a) => a.line1)).toEqual(['Parents, Satellite'])
        expect(list[0].line1).toBe('Parents, Satellite') // default listed first
    })

    test.each([
        ['phone', '12345', 'Enter a 10-digit mobile number'],
        ['phone', '5876543210', 'Enter a 10-digit mobile number'], // Indian mobiles start 6-9
        ['pincode', '38009', 'Enter a 6-digit PIN code'],
        ['pincode', '012345', 'Enter a 6-digit PIN code'],
        ['state', 'Atlantis', 'Choose a state'],
        ['line1', '', 'Address line 1 is required'],
    ])('%s "%s" is rejected', async (field, value, message) => {
        const res = await add(asha, { [field]: value })
        expect(res.status).toBe(400)
        expect(res.body.errors[field]).toBe(message)
    })

    test('the user can’t be chosen through the body', async () => {
        const res = await add(ravi, { user: new mongoose.Types.ObjectId().toString() })
        expect(res.status).toBe(201)
        expect(res.body.data.user).toBe(ravi.user._id.toString())
    })
})

describe('editing and removing', () => {
    test('making another address the default moves the flag', async () => {
        const office = (await listOf(asha)).find((a) => a.line1 === 'Office, CG Road')
        const res = await asha.patch(v1(`/addresses/${office._id}`)).send({ isDefault: true, city: 'Gandhinagar' })
        expect(res.status).toBe(200)
        expect(res.body.data).toMatchObject({ isDefault: true, city: 'Gandhinagar' })
        expect((await listOf(asha)).filter((a) => a.isDefault)).toHaveLength(1)
    })

    test('isDefault: false is ignored so there is always a default', async () => {
        const current = (await listOf(asha)).find((a) => a.isDefault)
        const res = await asha.patch(v1(`/addresses/${current._id}`)).send({ isDefault: false })
        expect(res.body.data.isDefault).toBe(true)
    })

    test('removing the default makes another address the default', async () => {
        const current = (await listOf(asha)).find((a) => a.isDefault)
        expect((await asha.delete(v1(`/addresses/${current._id}`))).status).toBe(200)
        const list = await listOf(asha)
        expect(list).toHaveLength(2)
        expect(list.filter((a) => a.isDefault)).toHaveLength(1)
    })
})

describe('privacy', () => {
    test('users only see their own addresses', async () => {
        const ravis = await listOf(ravi)
        expect(ravis).toHaveLength(1)
        expect((await listOf(asha)).map((a) => a._id)).not.toContain(ravis[0]._id)
    })

    test('another user’s address looks like it doesn’t exist', async () => {
        const ashas = (await listOf(asha))[0]
        expect((await ravi.patch(v1(`/addresses/${ashas._id}`)).send({ city: 'Surat' })).status).toBe(404)
        expect((await ravi.delete(v1(`/addresses/${ashas._id}`))).status).toBe(404)
        expect((await listOf(asha))[0].city).not.toBe('Surat')
    })

    test('addresses need a login', async () => {
        expect((await request(app).get(v1('/addresses'))).status).toBe(401)
    })
})

test(`a user can save up to ${MAX_ADDRESSES} addresses`, async () => {
    const meera = await loginAs(app, 'Customer', 'meera@example.com')
    for (let i = 0; i < MAX_ADDRESSES; i++) expect((await add(meera, { line1: `Flat ${i}` })).status).toBe(201)
    const res = await add(meera, { line1: 'One too many' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/up to 10 addresses/)
})
