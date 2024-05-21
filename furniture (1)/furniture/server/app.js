const mongoose=require('mongoose')  /*MONGOOSE AND EXPRESS REQUIRE AND USE ....*/
const express=require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

/*app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded({extended:true}))*/

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


mongoose.connect("mongodb://127.0.0.1:27017/database",{},  (err)=>{
    if(err){
      console.log("error in database connection........")
    }else
    {
       console.log("db connected successfully.....")

    }
})

const PORT=3550
app.listen(PORT,()=>{
    console.log("server is running at port number ",PORT)
})