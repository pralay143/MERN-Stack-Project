const { z, text, optionalText, objectId, email, phone, pincode } = require('../../utils/validators')

// userId is only honoured for admins (see the controller).
const create = z.object({
    vendorName: text('Vendor name', 200),
    address: optionalText('Address', 500),
    stateId: objectId('State').optional(),
    cityId: objectId('City').optional(),
    pincode,
    contactNum: phone('Contact number'),
    customerSupportNumber: phone('Customer support number'),
    feedbackEmail: email('Feedback email').optional(),
    userId: objectId('User').optional(),
})

const update = create.partial()

module.exports = { create, update }
