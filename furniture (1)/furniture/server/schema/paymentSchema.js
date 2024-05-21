const mongoose=require('mongoose')
const Schema=mongoose.Schema

const paymentSchema=new Schema({
    orderId:{
        type:Schema.Types.ObjectId,
        ref:'order'
    },
    status:{
        type:String,
        
    },
    amount:{
        type:String,
        required:true

    },
    type:{
        type:String,
        required:true
    },
    transcationCode:{
        type:String,
        required:true
    }

})

module.exports=mongoose.model('payment',paymentSchema)