require('dotenv').config({ quiet: true })
const mongoose=require('mongoose')
const express=require('express')
const cors = require('cors')

const app =express()
app.use(cors())
app.use(express.json())

const userRoutes=require('./routes/userRoutes')
const roleRoutes=require('./routes/roleRoutes')
const categoryRoutes=require('./routes/categoryRoutes')
const subcategoryRoutes=require('./routes/subcategoryRoutes')
const brandRoutes=require('./routes/brandRoutes')
const fileUploadRoutes=require('./routes/fileUploadRoutes')
const productRoutes=require('./routes/productRoutes')
const cityRoutes=require('./routes/cityRoutes')
const stateRoutes=require('./routes/stateRoutes')
const vendor_detailRoutes=require('./routes/vendor_detailRoutes')
const vendor_productRoutes=require('./routes/vendor_productRoutes')

    

app.use('/user',userRoutes)
app.use('/role',roleRoutes)
app.use('/category',categoryRoutes)
app.use('/subcategory',subcategoryRoutes)
app.use('/Brand',brandRoutes)
app.use('/upload',fileUploadRoutes)
app.use('/product',productRoutes)
app.use('/state',stateRoutes)
app.use('/city',cityRoutes)
app.use('/vendor',vendor_detailRoutes)
app.use('/vproduct',vendor_productRoutes)


module.exports = app

// Connect and listen only when run directly (node app.js), not when
// imported by the tests.
if (require.main === module) {
    const MONGO_URI=process.env.MONGO_URI
    if(!MONGO_URI){
        console.log('MONGO_URI is not set. Copy .env.example to .env and fill it in.')
        process.exit(1)
    }

    mongoose.connect(MONGO_URI,{},  (err)=>{
        if(err){
          console.log("error in database connection........", err.message)
        }else
        {
           console.log("db connected successfully.....")

        }
    })

    const PORT=process.env.PORT || 3550
    app.listen(PORT,()=>{
        console.log("server is running at port number ",PORT)
    })
}
