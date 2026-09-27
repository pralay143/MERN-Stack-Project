const mongoose=require('mongoose')
const Schema=mongoose.Schema

const stateSchema= new Schema({
    stateName:{
       type:String,
       required:true
    }
})

module.exports=mongoose.model('state',stateSchema)