const mongoose=require('mongoose')
const Schema=mongoose.Schema

const vendor_product_imagesSchema=new Schema({
     vendor_productId:{
        type:Schema.Types.ObjectId,
        ref:'vendor_product'
     },
     vendorId:{
        type:Schema.Types.ObjectId,
        ref:'user'
     },
     imageUrl:{
        type:String,
        required:true
     }


})

module.exports=mongoose.model('vendor_product_images',vendor_product_imagesSchema)


