const mongoose=require('mongoose')
const Schema=mongoose.Schema

const customer_addressSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    address:{
        type:String,
        required:true
    },
    stateId:{
        type:Schema.Types.ObjectId,
        ref:'state'
    },
    cityId:{
        type:Schema.Types.ObjectId,
         ref:'city'
    },
    pincode:{
        type:String,
        required:true
    },
    isDefualt:{
        type:Boolean,
        required:true
    },
})

module.exports=mongoose.model('customer_address',customer_addressSchema)