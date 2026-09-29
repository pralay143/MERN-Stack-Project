// Store rules shared by the cart, checkout and orders. Money is in paise.

module.exports = {
    // Most of one product a customer can buy in one order.
    MAX_QUANTITY_PER_ITEM: 10,
    // Most different products in one cart.
    MAX_CART_LINES: 30,

    // Delivery is free for orders of at least FREE_DELIVERY_FROM; smaller
    // orders pay DELIVERY_FEE. Prices already include GST.
    FREE_DELIVERY_FROM: 2000000, // ₹20,000
    DELIVERY_FEE: 49900, // ₹499
}
