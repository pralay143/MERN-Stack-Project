const mongoose=require('mongoose')
const Schema=mongoose.Schema

const statusSchema=new Schema({
    status:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model('status',statusSchema)

