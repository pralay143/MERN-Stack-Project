const categorySchema = require('../schema/categorySchema')


const addCategory=(req,res)=>{
    
    const category=new categorySchema(req.body)
    
    category.save((err,data)=>{
      if(err){
        res.status(404).json({
            message:"error in adding Category..."
        })
      }else{
        res.status(200).json({
            message:"Category added successfully...",
            data:data
        })
      }
    })
}

const getCategory=(req,res)=>{

    categorySchema.find((err, users) => {
        if(err){
            res.status(404).json({
                message:"Category not found...."
            })
        }else{
            res.status(200).json({
                message:"Category found successfully....",
               data:users
            })
        }
    })
}





const updateCategory=(req,res)=>{
    const id =req.params.id

    categorySchema.findByIdAndUpdate(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in updating Category"
            })
        }else{
            res.status(200).json({
                message:"Category upadate successfully...",
                data:success
            })
        }
    })
}

const deleteCategory=(req,res)=>{
    const id =req.params.id

    categorySchema.findByIdAndRemove(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in removing Category"
            })
        }else{
            res.status(200).json({
                message:"Category remove successfully...",
                data:success
            })
        }
    })
}

















module.exports={
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory

}