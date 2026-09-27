const { z, objectId } = require('../../utils/validators')

// vendorId is only honoured for admins (see the controller).
const create = z.object({
    productId: objectId('Product'),
    vendorId: objectId('Vendor').optional(),
    quantity: z.coerce.number('Quantity must be a number').int('Quantity must be a whole number').min(0, 'Quantity cannot be negative').default(0),
})

module.exports = { create }
