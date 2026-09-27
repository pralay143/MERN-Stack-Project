// Security headers, CORS allowlist, cross-origin write blocking and rate limits.
const request = require('supertest')
const app = require('../src/app')
const { createApp } = require('../src/app')
const db = require('./helpers/db')
const { createRoles, PASSWORD } = require('./helpers/auth')
const User = require('../src/modules/user/user.model')

const ALLOWED = 'http://localhost:3000'
const FOREIGN = 'https://evil.example.com'
const v1 = (path) => `/api/v1${path}`

beforeAll(async () => {
    await db.connect()
    await createRoles()
    await User.create({ name: 'Limit', email: 'limit@example.com', password: PASSWORD })
})
afterAll(db.close)

describe('security headers (Helmet)', () => {
    test('are set and X-Powered-By is removed', async () => {
        const res = await request(app).get(v1('/categories'))
        expect(res.headers['x-content-type-options']).toBe('nosniff')
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
        expect(res.headers['strict-transport-security']).toBeDefined()
        expect(res.headers['x-powered-by']).toBeUndefined()
    })
})

describe('CORS', () => {
    test('an allowed origin may read responses and send cookies', async () => {
        const res = await request(app).get(v1('/categories')).set('Origin', ALLOWED)
        expect(res.headers['access-control-allow-origin']).toBe(ALLOWED)
        expect(res.headers['access-control-allow-credentials']).toBe('true')
    })

    test('other origins get no CORS headers', async () => {
        const res = await request(app).get(v1('/categories')).set('Origin', FOREIGN)
        expect(res.headers['access-control-allow-origin']).toBeUndefined()
    })

    test('preflight succeeds for an allowed origin only', async () => {
        const preflight = (origin) =>
            request(app)
                .options(v1('/auth/login'))
                .set('Origin', origin)
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'content-type')
        const ok = await preflight(ALLOWED)
        expect(ok.status).toBe(204)
        expect(ok.headers['access-control-allow-origin']).toBe(ALLOWED)
        expect((await preflight(FOREIGN)).headers['access-control-allow-origin']).toBeUndefined()
    })
})

describe('cross-origin writes', () => {
    test('are refused from origins not on the allowlist', async () => {
        const res = await request(app)
            .post(v1('/auth/login'))
            .set('Origin', FOREIGN)
            .send({ email: 'limit@example.com', password: PASSWORD })
        expect(res.status).toBe(403)
    })

    test('are accepted from the allowlisted origin', async () => {
        const res = await request(app)
            .post(v1('/auth/login'))
            .set('Origin', ALLOWED)
            .send({ email: 'limit@example.com', password: PASSWORD })
        expect(res.status).toBe(200)
    })

    test('reads from other origins still work (the browser just hides them)', async () => {
        expect((await request(app).get(v1('/categories')).set('Origin', FOREIGN)).status).toBe(200)
    })
})

describe('rate limits', () => {
    const wrongLogin = (client, path = v1('/auth/login')) => client.post(path).send({ email: 'limit@example.com', password: 'wrong-password' })

    test('failed logins are limited per IP, across the v1 and legacy routes', async () => {
        const limited = request(createApp({ loginRateLimit: 3 }))
        expect((await wrongLogin(limited)).status).toBe(401)
        expect((await wrongLogin(limited)).status).toBe(401)
        expect((await wrongLogin(limited, '/user/user/login')).status).toBe(401)

        const blocked = await wrongLogin(limited)
        expect(blocked.status).toBe(429)
        expect(blocked.body.message).toMatch(/Too many attempts/)
        expect(blocked.headers['retry-after']).toBeDefined()
    })

    test('successful logins do not count towards the limit', async () => {
        const limited = request(createApp({ loginRateLimit: 2 }))
        for (let i = 0; i < 5; i++) {
            const res = await limited.post(v1('/auth/login')).send({ email: 'limit@example.com', password: PASSWORD })
            expect(res.status).toBe(200)
        }
    })

    test('registrations are limited per IP', async () => {
        const limited = request(createApp({ registerRateLimit: 2 }))
        const register = (n) =>
            limited.post(v1('/auth/register')).send({ name: 'R', email: `r${n}@example.com`, password: PASSWORD })
        expect((await register(1)).status).toBe(201)
        expect((await register(2)).status).toBe(201)
        expect((await register(3)).status).toBe(429)
    })

    test('other routes are not rate limited', async () => {
        const limited = request(createApp({ loginRateLimit: 1, registerRateLimit: 1 }))
        for (let i = 0; i < 5; i++) expect((await limited.get(v1('/categories'))).status).toBe(200)
    })
})
