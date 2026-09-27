// Login cookie, session checks and the auth middleware.
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs, PASSWORD } = require('./helpers/auth')
const { expectNoPassword } = require('./helpers/noPassword')
const { requireAuth, requireRole } = require('../src/middleware/auth')
const errorHandler = require('../src/middleware/errorHandler')
const User = require('../src/modules/user/user.model')

const api = request(app)
const v1 = (path) => `/api/v1${path}`
const tokenCookie = (res) => (res.headers['set-cookie'] || []).find((c) => c.startsWith('token='))
const signed = (payload, options) => jwt.sign(payload, process.env.JWT_SECRET, options)

beforeAll(db.connect)
afterAll(db.close)

describe('login and logout', () => {
    let customer

    beforeAll(async () => {
        customer = await loginAs(app, 'Customer')
    })

    test('login sets an httpOnly, SameSite=Lax token cookie', async () => {
        const res = await api.post(v1('/auth/login')).send({ email: 'customer@example.com', password: PASSWORD })
        expect(res.status).toBe(200)
        const cookie = tokenCookie(res)
        expect(cookie).toMatch(/HttpOnly/i)
        expect(cookie).toMatch(/SameSite=Lax/i)
        expect(cookie).toMatch(/Path=\//)
        expect(res.body.data.role.name).toBe('Customer')
        expectNoPassword(res)
    })

    test('a failed login sets no cookie', async () => {
        const res = await api.post(v1('/auth/login')).send({ email: 'customer@example.com', password: 'wrong' })
        expect(res.status).toBe(401)
        expect(tokenCookie(res)).toBeUndefined()
    })

    test('GET /auth/me returns the logged-in user', async () => {
        const res = await customer.get(v1('/auth/me'))
        expect(res.status).toBe(200)
        expect(res.body.data.email).toBe('customer@example.com')
        expectNoPassword(res)
    })

    test('GET /auth/me without a cookie returns 401', async () => {
        expect((await api.get(v1('/auth/me'))).status).toBe(401)
    })

    test('logout clears the cookie and ends the session', async () => {
        const res = await customer.post(v1('/auth/logout'))
        expect(res.status).toBe(200)
        expect(tokenCookie(res)).toMatch(/token=;/)
        expect((await customer.get(v1('/auth/me'))).status).toBe(401)
    })

    test('legacy login also sets the cookie and keeps the array response', async () => {
        const res = await api.post('/user/user/login').send({ email: 'customer@example.com', password: PASSWORD })
        expect(res.status).toBe(200)
        expect(res.body.data[0].email).toBe('customer@example.com')
        expect(tokenCookie(res)).toMatch(/HttpOnly/i)
    })
})

describe('rejected tokens', () => {
    let user

    beforeAll(async () => {
        user = await User.findOne({ email: 'customer@example.com' })
    })

    const meWith = (token) => api.get(v1('/auth/me')).set('Cookie', `token=${token}`)

    test('garbage token', async () => {
        expect((await meWith('not-a-jwt')).status).toBe(401)
    })

    test('token signed with a different secret', async () => {
        const forged = jwt.sign({ sub: user._id.toString(), role: 'Admin' }, 'someone-elses-secret')
        expect((await meWith(forged)).status).toBe(401)
    })

    test('expired token', async () => {
        const expired = signed({ sub: user._id.toString() }, { expiresIn: -10 })
        expect((await meWith(expired)).status).toBe(401)
    })

    test('token for a deleted account', async () => {
        const ghost = await User.create({ name: 'Ghost', email: 'ghost@example.com', password: 'x' })
        const token = signed({ sub: ghost._id.toString() }, { expiresIn: '1h' })
        await User.findByIdAndDelete(ghost._id)
        expect((await meWith(token)).status).toBe(401)
    })
})

describe('requireRole', () => {
    // A tiny app so the middleware can be tested on its own.
    const mini = express()
    mini.use(cookieParser())
    mini.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => res.json({ ok: true }))
    mini.get('/staff', requireAuth, requireRole('admin', 'vendor'), (req, res) => res.json({ ok: true }))
    mini.get('/no-auth-first', requireRole('admin'), (req, res) => res.json({ ok: true }))
    mini.use(errorHandler)

    let admin, vendor, customer

    beforeAll(async () => {
        admin = await loginAs(app, 'Admin')
        vendor = await loginAs(app, 'Vendor')
        customer = await loginAs(app, 'Customer', 'customer2@example.com')
    })

    // Replays an agent's login cookie against the mini app.
    const as = async (agent, path) => {
        const res = await agent.post(v1('/auth/login')).send({ email: agent.user.email, password: PASSWORD })
        return request(mini).get(path).set('Cookie', tokenCookie(res).split(';')[0])
    }

    test('allows the listed role (case-insensitive)', async () => {
        expect((await as(admin, '/admin-only')).status).toBe(200)
    })

    test('returns 403 for a logged-in user with another role', async () => {
        const res = await as(customer, '/admin-only')
        expect(res.status).toBe(403)
        expect(res.body.message).toMatch(/permission/)
    })

    test('accepts any of several roles', async () => {
        expect((await as(vendor, '/staff')).status).toBe(200)
        expect((await as(customer, '/staff')).status).toBe(403)
    })

    test('returns 401 rather than 403 when nobody is logged in', async () => {
        expect((await request(mini).get('/admin-only')).status).toBe(401)
        expect((await request(mini).get('/no-auth-first')).status).toBe(401)
    })
})
