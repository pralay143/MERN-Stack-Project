const mongoose=require('mongoose')
const Schema=mongoose.Schema

const vendor_productSchema=new Schema({
   

     productId:{
      type:Schema.Types.ObjectId,
      ref:'product'
     },
     vendorId:{
      type:Schema.Types.ObjectId,
      ref:'vendor_detail'
     },
    qty:{
      type:Number
    
    },
     
       
})

module.exports=mongoose.model('vendor_product',vendor_productSchema)