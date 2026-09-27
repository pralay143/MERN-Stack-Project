// Building blocks for the Zod request schemas in each module's
// <feature>.validation.js.
const { z } = require('zod')

const missingOr = (label, wrongType) => ({
    error: (issue) => (issue.input === undefined ? `${label} is required` : wrongType),
})

// Required text, trimmed, 1..max characters.
const text = (label, max = 200) =>
    z
        .string(missingOr(label, `${label} must be text`))
        .trim()
        .min(1, `${label} is required`)
        .max(max, `${label} must be at most ${max} characters`)

const optionalText = (label, max = 1000) =>
    z.string(`${label} must be text`).trim().max(max, `${label} must be at most ${max} characters`).optional()

const objectId = (label) =>
    z.string(missingOr(label, `${label} must be an id`)).regex(/^[a-f\d]{24}$/i, `${label} must be a valid id`)

const email = (label = 'Email') =>
    z.string(missingOr(label, `${label} must be text`)).trim().toLowerCase().pipe(z.email('Enter a valid email address'))

// bcrypt only uses the first 72 bytes, so longer passwords are rejected.
const password = z
    .string(missingOr('Password', 'Password must be text'))
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')

const phone = (label = 'Phone number') =>
    z
        .string(`${label} must be text`)
        .trim()
        .regex(/^\+?[\d\s-]{7,15}$/, `${label} must be 7–15 digits`)
        .optional()

const pincode = z.string('Pincode must be text').trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional()

// Whole paise. Multipart forms send numbers as strings, hence coerce.
const paise = (label) =>
    z.coerce
        .number(missingOr(label, `${label} must be a number`))
        .int(`${label} must be a whole number of paise`)
        .nonnegative(`${label} cannot be negative`)

// Multipart forms send booleans as strings.
const boolean = z.preprocess((v) => (v === 'true' ? true : v === 'false' ? false : v), z.boolean('Must be true or false'))

module.exports = { z, text, optionalText, objectId, email, password, phone, pincode, paise, boolean }
