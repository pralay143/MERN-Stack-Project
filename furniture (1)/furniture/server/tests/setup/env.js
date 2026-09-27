// Runs before each test file (jest "setupFiles"). Values set here win over
// server/.env because dotenv never overrides existing variables.
const os = require('os')
const path = require('path')

process.env.NODE_ENV = 'test'
// Minimum bcrypt cost keeps hashing fast in tests.
process.env.BCRYPT_ROUNDS = '4'
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-32-characters-long'
// Effectively no rate limits, except in tests that build their own app.
process.env.LOGIN_RATE_LIMIT = '100000'
process.env.REGISTER_RATE_LIMIT = '100000'
