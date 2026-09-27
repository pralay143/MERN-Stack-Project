const { mongoUri, port } = require('./config/env')
const { connectDb } = require('./config/db')
const app = require('./app')

if (!mongoUri) {
    console.log('MONGO_URI is not set. Copy .env.example to .env and fill it in.')
    process.exit(1)
}

connectDb(mongoUri, (err) => {
    if (err) {
        console.log('error in database connection........', err.message)
    } else {
        console.log('db connected successfully.....')
    }
})

app.listen(port, () => {
    console.log('server is running at port number ', port)
})
