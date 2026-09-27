const jwt = require('jsonwebtoken')
const { jwtSecret, sessionDays, cookieSameSite, isProduction } = require('../config/env')

const AUTH_COOKIE = 'token'
const SESSION_MS = sessionDays * 24 * 60 * 60 * 1000

const cookieOptions = () => ({
    httpOnly: true, // not readable from JavaScript, so XSS can't steal it
    secure: isProduction || cookieSameSite === 'none',
    sameSite: cookieSameSite,
    path: '/',
})

const signToken = (user) =>
    jwt.sign({ sub: user._id.toString(), role: user.role?.name }, jwtSecret, { expiresIn: `${sessionDays}d` })

// Throws if the token is invalid or expired.
const verifyToken = (token) => jwt.verify(token, jwtSecret)

const setAuthCookie = (res, user) => res.cookie(AUTH_COOKIE, signToken(user), { ...cookieOptions(), maxAge: SESSION_MS })

const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE, cookieOptions())

module.exports = { AUTH_COOKIE, signToken, verifyToken, setAuthCookie, clearAuthCookie }
