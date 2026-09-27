const mongoose = require('mongoose')

function connectDb(uri, callback) {
    mongoose.connect(uri, {}, callback)
}

module.exports = { connectDb }
