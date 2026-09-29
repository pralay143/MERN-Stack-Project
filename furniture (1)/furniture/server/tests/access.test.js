// Checks every registered route (v1 and legacy) automatically:
//  - anything not listed in PUBLIC returns 401 without a login cookie
//  - every route guarded by requireRole returns 403 for the other roles
// A new route that forgets its guard fails here.
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAll } = require('./helpers/auth')
const { listRoutes } = require('./helpers/routes')

const PUBLIC = new Set([
    'POST /api/v1/auth/register',
    'POST /api/v1/auth/login',
    'POST /api/v1/auth/logout',
    'GET /api/v1/categories',
    'GET /api/v1/categories/:id',
    'GET /api/v1/subcategories',
    'GET /api/v1/subcategories/:id',
    'GET /api/v1/brands',
    'GET /api/v1/brands/:id',
    'GET /api/v1/products',
    'GET /api/v1/products/:id',
    'GET /api/v1/states',
    'GET /api/v1/cities',
    'GET /api/v1/vendor-products',
    // Called by Razorpay; protected by its signature instead of a login.
    'POST /api/v1/payments/razorpay/webhook',
    // Legacy equivalents used by the old client
    'POST /user/user',
    'POST /user/user/login',
    'GET /category/category',
    'GET /subcategory/subcategory',
    'GET /brand/brand',
    'GET /product/product',
    'GET /state/state',
    'GET /city/city',
    'GET /vproduct/get',
])

const routes = listRoutes(app)
const key = (r) => `${r.method} ${r.path}`
const urlFor = (r) => r.path.replace(/:id\b/g, new mongoose.Types.ObjectId().toString())
const send = (client, r) => client[r.method.toLowerCase()](urlFor(r)).send({})

let agents

beforeAll(async () => {
    await db.connect()
    agents = await loginAll(app)
})
afterAll(db.close)

test('route discovery found the v1 and legacy routes', () => {
    expect(routes.length).toBeGreaterThan(50)
    expect(routes.map(key)).toEqual(expect.arrayContaining(['GET /api/v1/users', 'DELETE /product/product/:id']))
})

test('every PUBLIC entry is a real route', () => {
    const existing = new Set(routes.map(key))
    expect([...PUBLIC].filter((k) => !existing.has(k))).toEqual([])
})

describe('without a login cookie', () => {
    const protectedRoutes = routes.filter((r) => !PUBLIC.has(key(r)))

    test.each(protectedRoutes.map((r) => [key(r), r]))('%s returns 401', async (_, r) => {
        expect((await send(request(app), r)).status).toBe(401)
    })

    test.each(routes.filter((r) => PUBLIC.has(key(r))).map((r) => [key(r), r]))('%s is public', async (_, r) => {
        expect([401, 403]).not.toContain((await send(request(app), r)).status)
    })
})

describe('with the wrong role', () => {
    const cases = routes.flatMap((r) =>
        (r.allowedRoles ? ['admin', 'vendor', 'customer'].filter((role) => !r.allowedRoles.includes(role)) : []).map(
            (role) => [`${role} → ${key(r)}`, role, r]
        )
    )

    test('there are role-guarded routes to check', () => {
        expect(cases.length).toBeGreaterThan(30)
    })

    test.each(cases)('%s returns 403', async (_, role, r) => {
        expect((await send(agents[role], r)).status).toBe(403)
    })
})
