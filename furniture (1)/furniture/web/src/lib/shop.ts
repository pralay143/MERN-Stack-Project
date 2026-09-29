// Store rules, mirrored from server/src/config/shop.js for display. The
// server applies them for real (and has the final say on totals).

/** Most of one product a customer can buy in one order. */
export const MAX_QUANTITY_PER_ITEM = 10

/** Delivery is free from this order value (paise); otherwise DELIVERY_FEE. */
export const FREE_DELIVERY_FROM = 2000000
export const DELIVERY_FEE = 49900

/** Unpaid orders are cancelled (and their items released) after this long. */
export const UNPAID_ORDER_MINUTES = 30
