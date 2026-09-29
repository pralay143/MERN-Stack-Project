const Address = require('../address/address.model')
const addressService = require('../address/address.service')
const cartService = require('../cart/cart.service')
const { FREE_DELIVERY_FROM, DELIVERY_FEE } = require('../../config/shop')

// Order totals for a subtotal (all in paise). Prices already include GST.
function totalsFor(subtotal) {
    const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE
    return {
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        freeDeliveryFrom: FREE_DELIVERY_FROM,
        // How much more to spend for free delivery (0 once it applies).
        amountForFreeDelivery: Math.max(0, FREE_DELIVERY_FROM - subtotal),
    }
}

// Everything the checkout page shows, worked out on the server from the
// user's own cart and address with current prices and stock. Placing the
// order (next step) uses this same calculation, so the total shown is the
// total charged. `blockers` says in plain words why an order can't be placed.
async function summary(userId, addressId) {
    const cart = await cartService.get(userId)
    const address = addressId
        ? await addressService.getOwned(userId, addressId)
        : await Address.findOne({ user: userId, isDefault: true })

    const blockers = []
    if (cart.items.length === 0) blockers.push('Your cart is empty')
    if (cart.hasProblems) blockers.push('Some items are sold out or have fewer left than you want; update your cart')
    if (!address) blockers.push('Add a delivery address')

    return {
        items: cart.items,
        itemCount: cart.itemCount,
        ...totalsFor(cart.subtotal),
        address,
        canPlaceOrder: blockers.length === 0,
        blockers,
    }
}

module.exports = { totalsFor, summary }
