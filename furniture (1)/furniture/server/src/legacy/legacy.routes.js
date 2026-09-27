// Old URLs used by the current CRA client, mapped onto the /api/v1
// controllers. Delete this file once the new client is live.
//
// Not kept: the old PUT routes (e.g. PUT /user/user). They had no :id in the
// path and never worked; use PATCH /api/v1/<resource>/:id instead.
const express = require('express')
const asyncHandler = require('../utils/asyncHandler')
const { uploadFile, uploadProductImage } = require('../middleware/upload')

const user = require('../modules/user/user.controller')
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

const router = express.Router()

router.get('/user/user', user.list)
router.post('/user/user', user.create)
router.post('/user/user/login', user.login)
router.get('/user/user/:id', user.getById)
router.delete('/user/user/:id', user.remove)

router.get('/role/role', role.list)
router.post('/role/role', role.create)

router.get('/category/category', category.list)
router.post('/category/category', category.create)
router.delete('/category/category/:id', category.remove)

router.get('/subcategory/subcategory', subcategory.list)
router.post('/subcategory/subcategory', subcategory.create)
router.delete('/subcategory/subcategory/:id', subcategory.remove)

router.get('/brand/brand', brand.list)
router.post('/brand/brand', brand.create)
router.delete('/brand/brand/:id', brand.remove)

// The old client reads the product list from "products" instead of "data".
router.get(
    '/product/product',
    asyncHandler(async (req, res) => {
        res.json({ message: 'Products found', products: await productService.list() })
    })
)
router.post('/product/product', uploadProductImage, product.create)
router.delete('/product/product/:id', product.remove)

router.get('/state/state', state.list)
router.post('/state/state', state.create)
router.get('/city/city', city.list)
router.post('/city/city', city.create)

router.get('/vendor/vendor', vendor.list)
router.post('/vendor/vendor', vendor.create)
router.get('/vendor/vendor/:id', vendor.getById)
router.delete('/vendor/vendor/:id', vendor.remove)

router.get('/vproduct/get', vendorProduct.list)
router.post('/vproduct/add', vendorProduct.create)

router.post('/upload/upload', uploadFile, upload.create)

module.exports = router
