const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongo

// Each test file gets its own throwaway in-memory MongoDB, so tests never
// touch the local development database.
async function connect() {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
}

async function clear() {
    const collections = await mongoose.connection.db.collections()
    await Promise.all(collections.map((c) => c.deleteMany({})))
}

async function close() {
    await mongoose.disconnect()
    if (mongo) await mongo.stop()
}

module.exports = { connect, clear, close }
