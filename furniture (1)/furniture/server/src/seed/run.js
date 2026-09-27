// CLI for the seed script.
//   npm run seed         add missing roles, categories and the admin user
//   npm run seed:reset   drop the database first, then seed
const mongoose = require('mongoose')
const { mongoUri } = require('../config/env')
const { connectDb } = require('../config/db')
const { seed } = require('./seed')

async function main() {
    const reset = process.argv.includes('--reset')

    if (!mongoUri) {
        console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.')
        process.exit(1)
    }
    if (reset && process.env.NODE_ENV === 'production') {
        console.error('Refusing to reset a production database.')
        process.exit(1)
    }

    await connectDb(mongoUri)
    const dbName = mongoose.connection.name
    if (reset) console.log(`Dropping database "${dbName}"...`)

    const summary = await seed({
        reset,
        adminEmail: process.env.SEED_ADMIN_EMAIL,
        adminPassword: process.env.SEED_ADMIN_PASSWORD,
    })

    console.log(`Seeded "${dbName}": ${summary.roles} roles, ${summary.categories} categories.`)
    if (!summary.adminCreated) {
        console.log(`Admin user ${summary.adminEmail} already exists; left unchanged.`)
    } else if (summary.generatedPassword) {
        console.log(`Created admin ${summary.adminEmail} with generated password: ${summary.generatedPassword}`)
        console.log('Set SEED_ADMIN_PASSWORD in .env to choose your own.')
    } else {
        console.log(`Created admin ${summary.adminEmail} with the password from SEED_ADMIN_PASSWORD.`)
    }

    await mongoose.disconnect()
}

main().catch(async (err) => {
    console.error('Seeding failed:', err.message)
    await mongoose.disconnect()
    process.exit(1)
})
