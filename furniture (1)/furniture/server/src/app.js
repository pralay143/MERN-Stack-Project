const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const config = require('./config/env')
const { corsForOrigins, rejectForeignOrigins, loginLimiter, registerLimiter } = require('./middleware/security')
const v1Routes = require('./routes/v1')
const legacyRoutes = require('./legacy/legacy.routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

// Builds the Express app. Options override config values (used by tests to
// get fresh rate limiters with small limits).
function createApp(options = {}) {
    const { corsOrigins, loginRateLimit, registerRateLimit, trustProxy, uploadDir } = { ...config, ...options }

    const app = express()
    if (trustProxy) app.set('trust proxy', trustProxy)

    app.use(helmet())
    app.use(corsForOrigins(corsOrigins))
    app.use(rejectForeignOrigins(corsOrigins))
    app.use(express.json())
    app.use(cookieParser())
    app.use(loginLimiter(loginRateLimit))
    app.use(registerLimiter(registerRateLimit))

    // Uploaded images. Random names never change, so they can be cached for
    // long. Cross-origin so the client (on another origin) can show them;
    // nosniff (from Helmet) stops browsers treating them as anything else.
    app.use(
        '/uploads',
        (req, res, next) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
            next()
        },
        express.static(uploadDir, { index: false, dotfiles: 'deny', maxAge: '30d', immutable: true })
    )

    app.use('/api/v1', v1Routes)
    app.use(legacyRoutes)

    // Must come after all routes.
    app.use(notFound)
    app.use(errorHandler)

    return app
}

module.exports = createApp()
module.exports.createApp = createApp
