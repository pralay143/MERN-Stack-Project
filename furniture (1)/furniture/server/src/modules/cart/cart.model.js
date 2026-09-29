const mongoose = require('mongoose')
const { MAX_QUANTITY_PER_ITEM } = require('../../config/shop')

const cartItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: MAX_QUANTITY_PER_ITEM,
            validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
        },
    },
    { _id: false }
)

// One cart per user. Prices aren't stored: the cart always shows (and
// checkout always charges) each product's current price.
const cartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Cart', cartSchema)
