const mongoose=require('mongoose')
const Schema=mongoose.Schema

const brandSchema= new Schema({
    brandName:{
        type:String,
        required:true

    },
    categoryId:{
         type:Schema.Types.ObjectId,
         ref:'category'
    }
})

module.exports=mongoose.model('/brand',brandSchema) 