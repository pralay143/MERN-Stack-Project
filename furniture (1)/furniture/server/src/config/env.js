const path = require('path')
require('dotenv').config({ quiet: true })

const SERVER_ROOT = path.resolve(__dirname, '..', '..')

module.exports = {
    mongoUri: process.env.MONGO_URI,
    port: process.env.PORT || 3550,

    // bcrypt cost factor. 12 is a sensible production default; tests lower it.
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,

    isProduction: process.env.NODE_ENV === 'production',

    // Signs login tokens. Required; the server refuses to start without it.
    jwtSecret: process.env.JWT_SECRET,
    // How long a login lasts (token expiry and cookie lifetime).
    sessionDays: Number(process.env.SESSION_DAYS) || 7,
    // 'lax' works when the client and API share a site (localhost, or
    // app.example.com + api.example.com). Use 'none' only if they are on
    // different sites; that also forces the Secure flag.
    cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',

    // Browser origins allowed to call the API with credentials
    // (comma-separated, e.g. https://efurniture.example.com).
    // Defaults to the new client's dev server (5173) and the old CRA app (3000).
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),

    // Max failed logins / registrations per IP in each window.
    loginRateLimit: Number(process.env.LOGIN_RATE_LIMIT) || 10, // per 15 minutes
    registerRateLimit: Number(process.env.REGISTER_RATE_LIMIT) || 10, // per hour

    // Number of proxies in front of the app (e.g. 1 on Render), so req.ip
    // is the real client for rate limiting. Unset when running directly.
    trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : false,

    // Where uploaded images are stored; served at /uploads/<name>.
    uploadDir: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(SERVER_ROOT, 'uploads'),
    maxUploadBytes: (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024,
}
