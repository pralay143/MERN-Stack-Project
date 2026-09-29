const { z, text, optionalText, boolean } = require('../../utils/validators')
const INDIAN_STATES = require('../../config/indianStates')

// Accepts "98765 43210", "+91 98765-43210" or "098765 43210"; stores the
// 10 digits.
const mobile = z
    .string('Mobile number is required')
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|0)(?=\d{10}$)/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number'))

const fields = {
    fullName: text('Full name', 100),
    phone: mobile,
    line1: text('Address line 1', 200),
    line2: optionalText('Address line 2', 200),
    landmark: optionalText('Landmark', 100),
    city: text('City', 100),
    state: z.enum(INDIAN_STATES, 'Choose a state'),
    pincode: z
        .string('PIN code is required')
        .trim()
        .regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code'),
    isDefault: boolean.optional(),
}

const create = z.object(fields)
const update = z.object(fields).partial()

module.exports = { create, update }
