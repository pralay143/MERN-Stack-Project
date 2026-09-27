const crypto = require('crypto')
const mongoose = require('mongoose')
const Role = require('../modules/role/role.model')
const Category = require('../modules/category/category.model')
const User = require('../modules/user/user.model')
const { roles, categories } = require('./seedData')

// Inserts roles, categories and an admin user. Safe to run repeatedly: existing
// records are left as they are. With { reset: true } the database is dropped
// first. Returns a summary, including a generated admin password if one was
// created.
async function seed({ reset = false, adminEmail, adminPassword } = {}) {
    if (reset) {
        await mongoose.connection.dropDatabase()
        // Recreate indexes, which dropDatabase removes.
        await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()))
    }

    for (const role of roles) {
        await Role.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true })
    }

    for (const categoryName of categories) {
        await Category.updateOne({ categoryName }, { $setOnInsert: { categoryName, isActive: true } }, { upsert: true })
    }

    const email = (adminEmail || 'admin@efurniture.local').toLowerCase()
    const summary = { roles: roles.length, categories: categories.length, adminEmail: email, adminCreated: false }

    if (!(await User.exists({ email }))) {
        const adminRole = await Role.findOne({ name: 'Admin' })
        const password = adminPassword || crypto.randomBytes(9).toString('base64url')
        // The User model hashes the password before saving.
        await User.create({ name: 'Admin', email, password, role: adminRole._id })
        summary.adminCreated = true
        if (!adminPassword) summary.generatedPassword = password
    }

    return summary
}

module.exports = { seed }
