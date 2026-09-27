const request = require('supertest')
const Role = require('../../src/modules/role/role.model')
const User = require('../../src/modules/user/user.model')
const { roles } = require('../../src/seed/seedData')

const PASSWORD = 'Secret@123'

// Creates the three roles (same ids as the seed script).
async function createRoles() {
    for (const role of roles) {
        await Role.updateOne({ _id: role._id }, { $setOnInsert: role }, { upsert: true })
    }
    return Object.fromEntries(roles.map((r) => [r.name, r._id]))
}

// Creates a user with the given role and returns a supertest agent that is
// logged in as them (the agent keeps the auth cookie between requests).
async function loginAs(app, roleName, email = `${roleName.toLowerCase()}@example.com`) {
    const roleIds = await createRoles()
    const user = await User.create({ name: roleName, email, password: PASSWORD, role: roleIds[roleName] })
    const agent = request.agent(app)
    const res = await agent.post('/api/v1/auth/login').send({ email, password: PASSWORD })
    if (res.status !== 200) throw new Error(`login as ${roleName} failed: ${res.status}`)
    agent.user = user
    return agent
}

// Logged-in agents for every role.
async function loginAll(app) {
    return {
        admin: await loginAs(app, 'Admin'),
        vendor: await loginAs(app, 'Vendor'),
        customer: await loginAs(app, 'Customer'),
    }
}

module.exports = { PASSWORD, createRoles, loginAs, loginAll }
