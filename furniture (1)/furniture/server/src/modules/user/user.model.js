const mongoose=require('mongoose')
const Schema=mongoose.Schema


const userSchema= new Schema({

    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        require:true
    },
    contactNum:{
        type:String,
       
    },
    role:{
        type:Schema.Types.ObjectId,
        ref:'role'
        
    }

})

module.exports=mongoose.model('user',userSchema)