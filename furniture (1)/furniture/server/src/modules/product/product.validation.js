const { z, text, optionalText, objectId, paise } = require('../../utils/validators')

// Sent as a multipart form (with the image), so numbers arrive as strings.
// The owner (user) is set from the login, never from the body.
const create = z.object({
    productName: text('Product name', 200),
    description: optionalText('Description', 5000),
    price: paise('Price'),
    categoryId: objectId('Category'),
    brandId: objectId('Brand').optional(),
})

const update = create.partial()

module.exports = { create, update }
