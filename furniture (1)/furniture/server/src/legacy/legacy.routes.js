// Old URLs used by the current CRA client, mapped onto the /api/v1
// controllers. Delete this file once the new client is live.
//
// Every route has the same guards as its /api/v1 equivalent, so these URLs
// are not a way around authentication. The old client doesn't send the
// login cookie, so its protected screens get 401 here.
//
// Not kept: the old PUT routes (e.g. PUT /user/user). They had no :id in the
// path and never worked; use PATCH /api/v1/<resource>/:id instead.
const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { requireAuth, adminOnly, vendorOrAdmin } = require('../middleware/auth')
const { uploadImage } = require('../middleware/upload')
const validate = require('../middleware/validate')
const { toPaise, toRupees } = require('../utils/money')
const { setAuthCookie } = require('../utils/session')

const user = require('../modules/user/user.controller')
const auth = require('../modules/auth/auth.controller')
const authService = require('../modules/auth/auth.service')
const role = require('../modules/role/role.controller')
const category = require('../modules/category/category.controller')
const subcategory = require('../modules/subcategory/subcategory.controller')
const brand = require('../modules/brand/brand.controller')
const product = require('../modules/product/product.controller')
const productService = require('../modules/product/product.service')
const state = require('../modules/location/state.controller')
const city = require('../modules/location/city.controller')
const vendor = require('../modules/vendor/vendor.controller')
const vendorProduct = require('../modules/vendorProduct/vendorProduct.controller')
const upload = require('../modules/upload/upload.controller')

const schemas = {
    auth: require('../modules/auth/auth.validation'),
    role: require('../modules/role/role.validation'),
    category: require('../modules/category/category.validation'),
    subcategory: require('../modules/subcategory/subcategory.validation'),
    brand: require('../modules/brand/brand.validation'),
    product: require('../modules/product/product.validation'),
    location: require('../modules/location/location.validation'),
    vendor: require('../modules/vendor/vendor.validation'),
    vendorProduct: require('../modules/vendorProduct/vendorProduct.validation'),
}

// Renames request body fields from the old client's names to the current
// schema's names, e.g. renameBody({ user: 'userId' }).
const renameBody = (mapping) => (req, res, next) => {
    for (const [oldName, newName] of Object.entries(mapping)) {
        if (req.body[oldName] !== undefined && req.body[newName] === undefined) {
            req.body[newName] = req.body[oldName]
        }
        delete req.body[oldName]
    }
    next()
}

// The old client sends and displays basePrice in rupees; the API stores
// price in paise.
const basePriceToPaise = (req, res, next) => {
    if (req.body.basePrice !== undefined && req.body.price === undefined) {
        req.body.price = toPaise(req.body.basePrice)
    }
    delete req.body.basePrice
    next()
}
const withBasePrice = (product) => ({ ...product.toObject(), basePrice: toRupees(product.price) })

const router = express.Router()

// Public: sign-up, login and the catalogue lists.
router.post('/user/user', validate(schemas.auth.register), auth.register)
// Same as /api/v1/auth/login, but the old client reads the user from data[0].
router.post(
    '/user/user/login',
    validate(schemas.auth.login),
    asyncHandler(async (req, res) => {
        const loggedIn = await authService.login(req.body.email, req.body.password)
        setAuthCookie(res, loggedIn)
        res.json({ message: 'Login successful', data: [loggedIn] })
    })
)
router.get('/category/category', category.list)
router.get('/subcategory/subcategory', subcategory.list)
router.get('/brand/brand', brand.list)
// The old client reads the product list from "products" instead of "data",
// with prices in rupees.
router.get(
    '/product/product',
    asyncHandler(async (req, res) => {
        const products = await productService.list()
        res.json({ message: 'Products found', products: products.map(withBasePrice) })
    })
)
router.get('/state/state', state.list)
router.get('/city/city', city.list)
router.get('/vproduct/get', vendorProduct.list)

// Users
router.get('/user/user', ...adminOnly, user.list)
router.get('/user/user/:id', requireAuth, user.getById)
router.delete('/user/user/:id', ...adminOnly, user.remove)
router.get('/role/role', ...adminOnly, role.list)
router.post('/role/role', ...adminOnly, validate(schemas.role.create), role.create)

// Catalogue management
router.post('/category/category', ...adminOnly, validate(schemas.category.create), category.create)
router.delete('/category/category/:id', ...adminOnly, category.remove)
router.post('/subcategory/subcategory', ...adminOnly, validate(schemas.subcategory.create), subcategory.create)
router.delete('/subcategory/subcategory/:id', ...adminOnly, subcategory.remove)
router.post('/brand/brand', ...adminOnly, validate(schemas.brand.create), brand.create)
router.delete('/brand/brand/:id', ...adminOnly, brand.remove)
router.post('/state/state', ...adminOnly, validate(schemas.location.createState), state.create)
router.post('/city/city', ...adminOnly, validate(schemas.location.createCity), city.create)

// Products and vendors
router.post(
    '/product/product',
    ...vendorOrAdmin,
    ...uploadImage,
    basePriceToPaise,
    renameBody({ qty: 'stock' }),
    validate(schemas.product.create),
    product.create
)
router.delete('/product/product/:id', ...vendorOrAdmin, product.remove)
router.get('/vendor/vendor', ...adminOnly, vendor.list)
router.post(
    '/vendor/vendor',
    ...vendorOrAdmin,
    renameBody({ user: 'userId', state: 'stateId', city: 'cityId', feedbackemail: 'feedbackEmail' }),
    validate(schemas.vendor.create),
    vendor.create
)
router.get('/vendor/vendor/:id', ...vendorOrAdmin, vendor.getById)
router.delete('/vendor/vendor/:id', ...adminOnly, vendor.remove)
router.post('/vproduct/add', ...vendorOrAdmin, renameBody({ qty: 'quantity' }), validate(schemas.vendorProduct.create), vendorProduct.create)
router.post('/upload/upload', ...vendorOrAdmin, ...uploadImage, upload.create)

module.exports = router
