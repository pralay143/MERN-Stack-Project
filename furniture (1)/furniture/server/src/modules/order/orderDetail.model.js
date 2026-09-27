const mongoose=require('mongoose')
const Schema=mongoose.Schema

const order_detailsSchema=new Schema({
    orderId:{
        type:Schema.Types.ObjectId,
        ref:'order'
    },
    userId:{
        type:Schema.Types.ObjectId,
         ref:'user'
    },
    qyt:{
        type:String,
        required:true

    },
    price:{
        type:String,
        required:true
    },
    vendor_productId:{
        type:Schema.Types.ObjectId,
        ref:'vendor_product'
    }
})

module.exports=mongoose.model('order_details',order_detailsSchema)