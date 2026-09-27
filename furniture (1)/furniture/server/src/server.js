const { mongoUri, port, jwtSecret } = require('./config/env')
const { connectDb } = require('./config/db')
const app = require('./app')

async function start() {
    if (!mongoUri) {
        console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.')
        process.exit(1)
    }
    if (!jwtSecret || jwtSecret.length < 32) {
        console.error('JWT_SECRET must be set to a random string of at least 32 characters (see .env.example).')
        process.exit(1)
    }

    // Start listening only once the database is reachable. A server without a
    // connection would accept requests and time out on every query.
    try {
        await connectDb(mongoUri)
        console.log('db connected successfully.....')
    } catch (err) {
        console.error('error in database connection........', err.message)
        process.exit(1)
    }

    app.listen(port, () => {
        console.log('server is running at port number ', port)
    })
}

start()
