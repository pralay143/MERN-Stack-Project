const mongoose = require('mongoose')

// Fail after 5s instead of the default 30s when MongoDB is not reachable.
const connectDb = (uri) => mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })

module.exports = { connectDb }
