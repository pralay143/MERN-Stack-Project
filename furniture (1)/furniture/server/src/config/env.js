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

    // General file uploads (POST /upload/upload).
    uploadDir: path.join(SERVER_ROOT, 'uploads'),

    // Product images are still written into the CRA client's public folder,
    // because the current client displays them from /uploads/<name>.
    productImageDir: path.resolve(SERVER_ROOT, '..', 'client', 'public', 'uploads'),
}
