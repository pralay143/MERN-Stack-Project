const cors = require('cors')
const rateLimit = require('express-rate-limit')
const ApiError = require('../utils/ApiError')

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// CORS for the allowlisted origins, with cookies. Requests without an Origin
// header (curl, server-to-server, same-origin) are allowed.
const corsForOrigins = (origins) =>
    cors({
        origin: (origin, callback) => callback(null, !origin || origins.includes(origin)),
        credentials: true,
    })

// CORS only controls what a browser lets a page read; it doesn't stop a
// cross-site form post from being sent. Refusing state-changing requests
// from other origins closes that gap (CSRF defence alongside SameSite).
const rejectForeignOrigins = (origins) => (req, res, next) => {
    const origin = req.headers.origin
    if (SAFE_METHODS.has(req.method) || !origin || origins.includes(origin)) return next()
    next(ApiError.forbidden('Requests from this origin are not allowed'))
}

const limiter = (limit, windowMs, options = {}) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message: 'Too many attempts. Please wait a while and try again.' },
        ...options,
    })

// Applies a limiter to POST requests on exactly these paths.
const limitPosts = (paths, limit) => (req, res, next) =>
    req.method === 'POST' && paths.includes(req.path) ? limit(req, res, next) : next()

// Failed logins only, so people who log in successfully are never blocked.
const loginLimiter = (max) =>
    limitPosts(['/api/v1/auth/login', '/user/user/login'], limiter(max, 15 * 60 * 1000, { skipSuccessfulRequests: true }))

const registerLimiter = (max) => limitPosts(['/api/v1/auth/register', '/user/user'], limiter(max, 60 * 60 * 1000))

module.exports = { corsForOrigins, rejectForeignOrigins, loginLimiter, registerLimiter }
