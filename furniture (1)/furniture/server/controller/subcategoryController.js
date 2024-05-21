const subcategorySchema = require('../schema/subcategorySchema')


const addSubcategory=(req,res)=>{
    
    const subcategory=new subcategorySchema(req.body)
    
    subcategory.save((err,data)=>{
      if(err){
        res.status(404).json({
            message:"error in adding subcategory..."
        })
      }else{
        res.status(200).json({
            message:"subcategory added successfully...",
            data:data
        })
      }
    })
}

 const getSubcategory=(req,res)=>{
    subcategorySchema.find().populate('categoryDetail').exec((err,data)=>{
        if(err){
            res.status(404).json({
                message:"error in found"
            })
        }else{
            res.status(200).json({
                message:"subcategory found successfully....",
                data:data
            })
        }
    })
 }







const updateSubcategory=(req,res)=>{
    const id =req.params.id

    subcategorySchema.findByIdAndUpdate(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in updating subcategory"
            })
        }else{
            res.status(200).json({
                message:"subcategory upadate successfully...",
                data:success
            })
        }
    })
}

const deleteSubcategory=(req,res)=>{
    const id =req.params.id

    subcategorySchema.findByIdAndRemove(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in removing subcategory"
            })
        }else{
            res.status(200).json({
                message:"subcategory remove successfully...",
                data:success
            })
        }
    })
}

















module.exports={
    getSubcategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory

}