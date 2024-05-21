const brandSchema=require('../schema/brandSchema')



const addBrand=(req,res)=>{
    
    const brand=new brandSchema(req.body)
    
    brand.save((err,data)=>{
      if(err){
        res.status(404).json({
            message:"error in adding Brand..."
        })
      }else{
        res.status(200).json({
            message:"Brand added successfully...",
            data:data
        })
      }
    })
}

const getBrand=(req,res)=>{

    brandSchema.find().populate('categoryId').exec((err,data)=>{
        if(err){
            res.status(404).json({
                message:"Brand not found...."
            })
        }else{
            res.status(200).json({
                message:"Brand found successfully....",
               data:data
            })
        }
    })
}

const updateBrand=(req,res)=>{
    const id =req.params.id

    brandSchema.findByIdAndUpdate(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in updating Brand"
            })
        }else{
            res.status(200).json({
                message:"Brand upadate successfully...",
                data:success
            })
        }
    })
}

const deleteBrand=(req,res)=>{
    const id =req.params.id

    brandSchema.findByIdAndRemove(id,req.body,(err,success)=>{
        if(err){
            res.status(404).json({
                message:"error in removing Brand"
            })
        }else{
            res.status(200).json({
                message:"Brand remove successfully...",
                data:success
            })
        }
    })
}






module.exports={
   addBrand,
   getBrand,
   updateBrand,
   deleteBrand
}