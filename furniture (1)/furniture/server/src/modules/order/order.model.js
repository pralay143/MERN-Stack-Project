const mongoose=require('mongoose')
const Schema=mongoose.Schema

const orderSchema=new Schema({
    addressId:{
        type:Schema.Types.ObjectId,
        ref:'customer_address'
    },
    userId:{
        type:Schema.Types.ObjectId,
         ref:'user'
    },
    total:{
        type:String,
        required:true

    },
    statusId:{
        type:Schema.Types.ObjectId,
        ref:'status'
    }
})

module.exports=mongoose.model('order',orderSchema)