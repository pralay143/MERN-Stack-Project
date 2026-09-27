const { z, text, email, password, phone } = require('../../utils/validators')

// Public sign-up. There is deliberately no role field.
const register = z.object({
    name: text('Name', 100),
    email: email(),
    password,
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], 'Gender must be MALE, FEMALE or OTHER').optional(),
    contactNum: phone('Contact number'),
})

// Only checks presence, so a malformed email still gets the same 401 as a
// wrong password.
const login = z.object({
    email: z.string('Email is required').trim().min(1, 'Email is required'),
    password: z.string('Password is required').min(1, 'Password is required'),
})

module.exports = { register, login }
