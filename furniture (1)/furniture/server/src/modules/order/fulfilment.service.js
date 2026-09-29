// Orders from the store's side: sellers see and fulfil their own items,
// admins see and manage every order.
const Order = require('./order.model')
const { releaseStock, transition } = require('./order.service')
const ApiError = require('../../utils/ApiError')
const { hasRole } = require('../../middleware/auth')

const isAdmin = (user) => hasRole(user, 'admin')
const sameId = (a, b) => a != null && b != null && a.toString() === b.toString()

// Orders a seller can act on: paid ones (including later cancelled) with an item of theirs.
const PAID_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled']

// A seller sees only their own items in an order (and not other sellers'
// prices or totals). Admins and the buyer see everything.
function viewFor(user, order) {
    if (isAdmin(user) || sameId(order.user, user._id)) return order
    const json = order.toJSON()
    json.items = json.items.filter((item) => sameId(item.seller, user._id))
    delete json.subtotal
    delete json.deliveryFee
    delete json.total
    delete json.payment
    json.sellerTotal = json.items.reduce((sum, item) => sum + item.lineTotal, 0)
    return json
}

// GET /orders/sold: all orders for admins; a seller's paid orders with their items.
async function listSold(user, { status, page, limit }) {
    const filter = {}
    if (isAdmin(user)) {
        if (status) filter.status = status
    } else {
        filter['items.seller'] = user._id
        filter.status = status && PAID_STATUSES.includes(status) ? status : { $in: PAID_STATUSES }
        filter['payment.paidAt'] = { $exists: true }
    }
    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email'),
        Order.countDocuments(filter),
    ])
    return { items: orders.map((o) => viewFor(user, o)), meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } }
}

// One order, for its buyer, an admin, or a seller with a paid item in it.
async function getForUser(user, orderId) {
    const order = await Order.findById(orderId)
    const allowed =
        order &&
        (sameId(order.user, user._id) ||
            isAdmin(user) ||
            (hasRole(user, 'vendor') && order.payment?.paidAt && order.items.some((item) => sameId(item.seller, user._id))))
    if (!allowed) throw ApiError.notFound('Order not found')
    return viewFor(user, order)
}

// The order's status follows its items once paid.
function statusFromItems(items) {
    if (items.every((item) => item.status === 'delivered')) return 'delivered'
    if (items.every((item) => item.status !== 'processing')) return 'shipped'
    return 'processing'
}

const NEXT_ITEM_STATUS = { processing: 'shipped', shipped: 'delivered' }

// PATCH /orders/:id/items/:productId { status }: shipped, then delivered.
async function updateItemStatus(user, orderId, productId, status) {
    const order = await Order.findById(orderId)
    const item = order?.items.find((i) => sameId(i.product, productId))
    // Sellers only find their own items; anything else is simply not found.
    if (!item || (!isAdmin(user) && !sameId(item.seller, user._id))) throw ApiError.notFound('Order item not found')
    if (!['processing', 'shipped'].includes(order.status)) {
        throw ApiError.conflict(
            order.status === 'pending_payment' ? 'This order hasn’t been paid yet' : `This order is ${order.status}; items can’t be updated`
        )
    }
    if (NEXT_ITEM_STATUS[item.status] !== status) {
        throw ApiError.conflict(
            item.status === 'delivered' ? 'This item has already been delivered' : `This item is ${item.status}; it can only be marked ${NEXT_ITEM_STATUS[item.status]} next`
        )
    }

    item.status = status
    if (status === 'shipped') item.shippedAt = new Date()
    if (status === 'delivered') item.deliveredAt = new Date()
    const orderStatus = statusFromItems(order.items)
    if (orderStatus !== order.status) order.setStatus(orderStatus, orderStatus === 'delivered' ? 'All items delivered' : 'All items shipped')
    await order.save()
    return viewFor(user, order)
}

// An admin cancels a paid order that hasn't started shipping. Stock goes
// back; the refund itself is made in the Razorpay dashboard.
async function adminCancel(orderId) {
    const reason = 'Cancelled by the store; refund to be made in Razorpay'
    const cancelled = await transition({ _id: orderId, 'items.status': { $nin: ['shipped', 'delivered'] } }, 'processing', 'cancelled', {
        note: reason,
        set: { cancelledAt: new Date(), cancelReason: reason },
    })
    if (!cancelled) {
        const order = await Order.findById(orderId)
        if (!order) throw ApiError.notFound('Order not found')
        throw ApiError.conflict(
            order.status === 'pending_payment' ? 'Unpaid orders are cancelled by the customer or expire on their own' : 'Only paid orders that haven’t shipped can be cancelled'
        )
    }
    await releaseStock(orderId)
    return Order.findById(orderId)
}

module.exports = { listSold, getForUser, updateItemStatus, adminCancel, statusFromItems, PAID_STATUSES }
