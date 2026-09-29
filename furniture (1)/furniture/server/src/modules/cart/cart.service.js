const Cart = require('./cart.model')
const Product = require('../product/product.model')
const ApiError = require('../../utils/ApiError')
const { MAX_QUANTITY_PER_ITEM, MAX_CART_LINES } = require('../../config/shop')

// Product fields the cart shows.
const PRODUCT_FIELDS = 'productName price stock file categoryId brandId user'

const idOf = (value) => (value?._id ?? value).toString()

// The cart as the API returns it: each line with the product's current
// details, its total, and a problem if it can't be bought as it stands.
function toView(cart) {
    const items = (cart?.items ?? []).map(({ product, quantity }) => {
        let problem = null
        if (product.stock <= 0) problem = 'out_of_stock'
        else if (quantity > product.stock) problem = 'not_enough_stock'
        return { product, quantity, lineTotal: product.price * quantity, problem }
    })
    return {
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
        hasProblems: items.some((item) => item.problem),
    }
}

// Loads the user's cart with products filled in. Lines whose product has
// been deleted are dropped (and the cart saved without them).
async function load(userId) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product', PRODUCT_FIELDS)
    if (!cart) return null
    const kept = cart.items.filter((item) => item.product)
    if (kept.length !== cart.items.length) {
        cart.items = kept
        await cart.save()
    }
    return cart
}

async function get(userId) {
    return toView(await load(userId))
}

// Sets how many of a product are in the cart, adding the line if needed.
async function setQuantity(userId, productId, quantity) {
    const product = await Product.findById(productId).select('stock productName')
    if (!product) throw ApiError.notFound('Product not found')
    if (product.stock <= 0) throw ApiError.conflict(`${product.productName} is out of stock`)
    if (quantity > product.stock) throw ApiError.conflict(`Only ${product.stock} left of ${product.productName}`)

    const cart = (await Cart.findOne({ user: userId })) ?? new Cart({ user: userId, items: [] })
    const line = cart.items.find((item) => idOf(item.product) === productId)
    if (line) {
        line.quantity = quantity
    } else {
        if (cart.items.length >= MAX_CART_LINES) {
            throw ApiError.badRequest(`A cart can hold up to ${MAX_CART_LINES} different products`)
        }
        cart.items.push({ product: productId, quantity })
    }
    await cart.save()
    return get(userId)
}

async function removeItem(userId, productId) {
    await Cart.updateOne({ user: userId }, { $pull: { items: { product: productId } } })
    return get(userId)
}

async function clear(userId) {
    await Cart.updateOne({ user: userId }, { $set: { items: [] } })
    return get(userId)
}

// Adds a visitor's browser cart to their account after they log in.
// Quantities are added to what's already there, capped by stock and the
// per-item limit. Unknown or sold-out products are skipped, not errors.
async function merge(userId, incoming) {
    const products = await Product.find({ _id: { $in: incoming.map((item) => item.productId) } }).select('stock')
    const stockOf = new Map(products.map((p) => [p._id.toString(), p.stock]))

    const cart = (await Cart.findOne({ user: userId })) ?? new Cart({ user: userId, items: [] })
    for (const { productId, quantity } of incoming) {
        const stock = stockOf.get(productId)
        if (!stock || stock <= 0) continue
        const line = cart.items.find((item) => idOf(item.product) === productId)
        const limit = Math.min(stock, MAX_QUANTITY_PER_ITEM)
        if (line) {
            line.quantity = Math.min(line.quantity + quantity, limit)
        } else if (cart.items.length < MAX_CART_LINES) {
            cart.items.push({ product: productId, quantity: Math.min(quantity, limit) })
        }
    }
    await cart.save()
    return get(userId)
}

module.exports = { get, load, toView, setQuantity, removeItem, clear, merge }
