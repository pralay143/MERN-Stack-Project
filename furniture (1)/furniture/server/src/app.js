const express = require('express')
const cors = require('cors')

const userRoutes = require('./modules/user/user.routes')
const roleRoutes = require('./modules/role/role.routes')
const categoryRoutes = require('./modules/category/category.routes')
const subcategoryRoutes = require('./modules/subcategory/subcategory.routes')
const brandRoutes = require('./modules/brand/brand.routes')
const uploadRoutes = require('./modules/upload/upload.routes')
const productRoutes = require('./modules/product/product.routes')
const stateRoutes = require('./modules/location/state.routes')
const cityRoutes = require('./modules/location/city.routes')
const vendorRoutes = require('./modules/vendor/vendor.routes')
const vendorProductRoutes = require('./modules/vendorProduct/vendorProduct.routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/user', userRoutes)
app.use('/role', roleRoutes)
app.use('/category', categoryRoutes)
app.use('/subcategory', subcategoryRoutes)
app.use('/Brand', brandRoutes)
app.use('/upload', uploadRoutes)
app.use('/product', productRoutes)
app.use('/state', stateRoutes)
app.use('/city', cityRoutes)
app.use('/vendor', vendorRoutes)
app.use('/vproduct', vendorProductRoutes)

// Must come after all routes.
app.use(notFound)
app.use(errorHandler)

module.exports = app
