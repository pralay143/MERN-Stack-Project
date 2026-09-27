const mongoose=require('mongoose')

const Schema=mongoose.Schema

const vendor_detailSchema= new Schema({
    vendorName:{
        type:String,
        
    },
    address:{
        type:String,
        
    },
    stateId:{
        type:Schema.Types.ObjectId,
        ref:'state'
    },
    cityId:{
        type:Schema.Types.ObjectId,
        ref:'city'
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    pincode:{
        type:String,
        
    },
    contactNum:{
        type:String,
        
    },
    customerSupportNumber:{
        type:String,
        
    },
    feedbackemail:{
        type:String,
        
    },
})


module.exports=mongoose.model('vendor_detail',vendor_detailSchema)