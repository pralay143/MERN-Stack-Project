const express = require('express')

const router = express.Router()

router.use('/auth', require('../modules/auth/auth.routes'))
router.use('/users', require('../modules/user/user.routes'))
router.use('/roles', require('../modules/role/role.routes'))
router.use('/categories', require('../modules/category/category.routes'))
router.use('/subcategories', require('../modules/subcategory/subcategory.routes'))
router.use('/brands', require('../modules/brand/brand.routes'))
router.use('/products', require('../modules/product/product.routes'))
router.use('/states', require('../modules/location/state.routes'))
router.use('/cities', require('../modules/location/city.routes'))
router.use('/vendors', require('../modules/vendor/vendor.routes'))
router.use('/vendor-products', require('../modules/vendorProduct/vendorProduct.routes'))
router.use('/uploads', require('../modules/upload/upload.routes'))

module.exports = router
