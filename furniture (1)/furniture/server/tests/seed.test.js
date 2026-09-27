const mongoose = require('mongoose')
const db = require('./helpers/db')
const { seed } = require('../src/seed/seed')
const Role = require('../src/modules/role/role.model')
const Category = require('../src/modules/category/category.model')
const User = require('../src/modules/user/user.model')

beforeAll(db.connect)
afterAll(db.close)

test('creates roles with the ids the CRA client expects', async () => {
    await seed({ adminPassword: 'pw' })
    const roles = Object.fromEntries((await Role.find()).map((r) => [r.name, r._id.toString()]))
    expect(roles).toEqual({
        Admin: '646afa55a201bba44448c941',
        Vendor: '646afa4fa201bba44448c943',
        Customer: '646afa59a201bba44448c945',
    })
})

test('creates the categories and an admin user with the Admin role', async () => {
    expect(await Category.countDocuments()).toBe(8)
    const admin = await User.findOne({ email: 'admin@efurniture.local' }).populate('role')
    expect(admin.role.name).toBe('Admin')
})

test('running again adds nothing and keeps existing records', async () => {
    await Category.create({ categoryName: 'Outdoor' })
    const summary = await seed({ adminPassword: 'different' })
    expect(summary.adminCreated).toBe(false)
    expect(await Role.countDocuments()).toBe(3)
    expect(await Category.countDocuments()).toBe(9)
    expect((await User.findOne({ email: 'admin@efurniture.local' })).password).toBe('pw')
})

test('generates an admin password when none is given', async () => {
    const summary = await seed({ adminEmail: 'Owner@Example.com' })
    expect(summary.adminEmail).toBe('owner@example.com')
    expect(summary.generatedPassword).toHaveLength(12)
})

test('reset drops existing data first', async () => {
    await mongoose.connection.collection('products').insertOne({ productName: 'Old' })
    await seed({ reset: true, adminPassword: 'pw' })
    expect(await mongoose.connection.collection('products').countDocuments()).toBe(0)
    expect(await Category.countDocuments()).toBe(8)
    expect(await User.countDocuments()).toBe(1)
})

test('unique indexes still work after a reset', async () => {
    await expect(User.create({ name: 'Dup', email: 'admin@efurniture.local', password: 'x' })).rejects.toThrow(/duplicate key/)
})
