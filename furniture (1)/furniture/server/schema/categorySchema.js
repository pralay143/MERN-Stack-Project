const mongoose=require('mongoose')
const Schema=mongoose.Schema

const categorySchema=new Schema({
    categoryName:{
        type:String
    },
    isActive:{
        type:Boolean
    }
})


module.exports=mongoose.model('category',categorySchema)