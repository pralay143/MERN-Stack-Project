const { z, text, email, phone, objectId } = require('../../utils/validators')
const auth = require('../auth/auth.validation')

// Admins create users with any role.
const create = auth.register.extend({ role: objectId('Role') })

// Profile updates. Passwords can't be changed here: that needs its own
// endpoint that checks the current password. Role changes are admin-only
// (enforced in the controller).
const update = z
    .object({
        name: text('Name', 100),
        email: email(),
        gender: z.enum(['MALE', 'FEMALE', 'OTHER'], 'Gender must be MALE, FEMALE or OTHER'),
        contactNum: phone('Contact number'),
        role: objectId('Role'),
    })
    .partial()

module.exports = { create, update }
