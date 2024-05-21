const vendor_productSchema=require('../schema/vendor_productSchema')


const getVproduct=(req, res)=>{

    vendor_productSchema.find().populate('productId').populate('vendorId').exec((err,data)=>{
        if(err){
            res.status(404).json({
                message:"error in fetching VendorProduct...."
            })
        }else {
            res.status(200).json({
                message:"VendorProduct found successfully.....",
                data:data
            })
        }
    })
}


const addVproduct=(req,res)=>{
    
    const vproduct= new vendor_productSchema(req.body)

    vproduct.save((err,data)=>{
        if(err){
            res.status(404).json({
                message:"error in adding VendorProduct..."
            })
        }else{
            res.status(200).json({
                message:"VendorProduct added successfully....",
                data:data
            })
        }
    })
}







module.exports={
    getVproduct,
    addVproduct
}