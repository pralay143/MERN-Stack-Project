const mongoose=require('mongoose')
const Schema=mongoose.Schema

const cartSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    vendorProductId:{
        type:Schema.Types.ObjectId,
        ref:'vendor_product'
    },
    qyt:{
       type:String,
       required:true
    }
})

module.exports=mongoose.model('cart',cartSchema)