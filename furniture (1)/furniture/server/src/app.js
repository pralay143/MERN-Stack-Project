const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const v1Routes = require('./routes/v1')
const legacyRoutes = require('./legacy/legacy.routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1', v1Routes)
app.use(legacyRoutes)

// Must come after all routes.
app.use(notFound)
app.use(errorHandler)

module.exports = app
