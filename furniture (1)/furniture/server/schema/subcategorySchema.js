const mongoose=require('mongoose')
const Schema=mongoose.Schema

const subcategorySchema=new Schema({
    categoryDetail:{
        type:Schema.Types.ObjectId,
        ref:'/category'
    },
    subcategoryName:{
        type:String
    },
    isActive:{
        type: String
    }
})


module.exports=mongoose.model('/subcategory',subcategorySchema)