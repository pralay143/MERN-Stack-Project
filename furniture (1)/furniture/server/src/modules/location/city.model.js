const mongoose=require('mongoose')
const Schema=mongoose.Schema

const citySchema= new Schema ({
    cityName:{
        type:String,
        required:true
    },
    state:{
        type:Schema.Types.ObjectId,
        ref:'state'
    }
   
})

module.exports=mongoose.model('city',citySchema)