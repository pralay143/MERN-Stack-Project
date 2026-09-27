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
    const stored = await User.findOne({ email: 'hash@example.com' })
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
    const user = await User.findOne({ email: 'hash@example.com' })
    await User.findByIdAndUpdate(user._id, { password: 'Changed@456' })
    const updated = await User.findById(user._id)
    expect(isBcryptHash(updated.password)).toBe(true)
    expect(await updated.comparePassword('Changed@456')).toBe(true)
})

test('saving an unrelated field does not re-hash the password', async () => {
    const user = await User.findOne({ email: 'hash@example.com' })
    const before = user.password
    user.name = 'Renamed'
    await user.save()
    expect((await User.findById(user._id)).password).toBe(before)
})
