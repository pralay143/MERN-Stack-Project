const { z, objectId } = require('../../utils/validators')
const { MAX_QUANTITY_PER_ITEM, MAX_CART_LINES } = require('../../config/shop')

const quantity = z.coerce
    .number('Quantity must be a number')
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_QUANTITY_PER_ITEM, `You can buy up to ${MAX_QUANTITY_PER_ITEM} of one product`)

// PUT /cart/items/:productId
const setQuantity = z.object({ quantity })

// POST /cart/merge: the browser cart of a visitor who has just logged in.
const merge = z.object({
    items: z
        .array(z.object({ productId: objectId('Product'), quantity }), 'Items must be a list')
        .max(MAX_CART_LINES * 2, 'Too many items'),
})

module.exports = { setQuantity, merge }
