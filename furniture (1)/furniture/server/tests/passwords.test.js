// Passwords are stored as bcrypt hashes and checked with bcrypt at login.
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const User = require('../src/modules/user/user.model')

const api = request(app)
const v1 = (path) => `/api/v1${path}`

beforeAll(db.connect)
afterAll(db.close)

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$.{53}$/.test(value)

test('new users get a bcrypt hash, not the plain password', async () => {
    await User.create({ name: 'Hash', email: 'hash@example.com', password: 'Plain@123' })
    const stored = await User.findOne({ email: 'hash@example.com' }).select('+password')
    expect(stored.password).not.toBe('Plain@123')
    expect(isBcryptHash(stored.password)).toBe(true)
})

test('login accepts the right password and rejects a wrong one', async () => {
    const ok = await api.post(v1('/auth/login')).send({ email: 'hash@example.com', password: 'Plain@123' })
    expect(ok.status).toBe(200)
    const bad = await api.post(v1('/auth/login')).send({ email: 'hash@example.com', password: 'plain@123' })
    expect(bad.status).toBe(401)
})

test('email lookup at login ignores case and surrounding spaces', async () => {
    const res = await api.post(v1('/auth/login')).send({ email: '  HASH@example.com ', password: 'Plain@123' })
    expect(res.status).toBe(200)
})

test('passwords changed through an update are hashed too', async () => {
    const user = await User.findOne({ email: 'hash@example.com' }).select('+password')
    await User.findByIdAndUpdate(user._id, { password: 'Changed@456' })
    const updated = await User.findById(user._id).select('+password')
    expect(isBcryptHash(updated.password)).toBe(true)
    expect(await updated.comparePassword('Changed@456')).toBe(true)
})

test('saving an unrelated field does not re-hash the password', async () => {
    const user = await User.findOne({ email: 'hash@example.com' }).select('+password')
    const before = user.password
    user.name = 'Renamed'
    await user.save()
    expect((await User.findById(user._id).select('+password')).password).toBe(before)
})

describe('passwords never appear in responses', () => {
    const { expectNoPassword } = require('./helpers/noPassword')
    let userId

    test('register', async () => {
        const res = await api.post(v1('/auth/register')).send({ name: 'P', email: 'p@example.com', password: 'Secret@123' })
        expect(res.status).toBe(201)
        expectNoPassword(res)
        userId = res.body.data._id
    })

    test('login', async () => {
        const res = await api.post(v1('/auth/login')).send({ email: 'p@example.com', password: 'Secret@123' })
        expect(res.status).toBe(200)
        expectNoPassword(res)
    })

    test('user list, get by id and update', async () => {
        for (const res of [
            await api.get(v1('/users')),
            await api.get(v1(`/users/${userId}`)),
            await api.patch(v1(`/users/${userId}`)).send({ name: 'P2' }),
        ]) {
            expect(res.status).toBe(200)
            expectNoPassword(res)
        }
    })

    test('vendor list with the user populated', async () => {
        await api.post(v1('/vendors')).send({ vendorName: 'Shop', userId })
        const res = await api.get(v1('/vendors'))
        expect(res.body.data[0].userId.email).toBe('p@example.com')
        expectNoPassword(res)
    })

    test('legacy user routes', async () => {
        for (const res of [await api.get('/user/user'), await api.get(`/user/user/${userId}`)]) {
            expect(res.status).toBe(200)
            expectNoPassword(res)
        }
    })

    test('delete', async () => {
        const res = await api.delete(v1(`/users/${userId}`))
        expect(res.status).toBe(200)
        expectNoPassword(res)
    })
})
