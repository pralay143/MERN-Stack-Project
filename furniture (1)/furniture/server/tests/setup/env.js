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
// Each Jest worker uploads into its own temporary folder, so tests never
// write into server/uploads and parallel test files don't see each other's files.
process.env.UPLOAD_DIR = path.join(os.tmpdir(), `efurniture-test-uploads-${process.env.JEST_WORKER_ID || 0}-${process.pid}`)
// Small limit so the size check is cheap to test.
process.env.MAX_UPLOAD_MB = '1'
// Dummy Razorpay keys: tests mock the Razorpay client, and these make sure the
// real keys from .env are never used (dotenv doesn't override set values).
process.env.RAZORPAY_KEY_ID = 'rzp_test_jest_dummy'
process.env.RAZORPAY_KEY_SECRET = 'jest_dummy_key_secret'
process.env.RAZORPAY_WEBHOOK_SECRET = 'jest_dummy_webhook_secret'
