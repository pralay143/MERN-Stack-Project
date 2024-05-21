const vendor_detailSchema=require('../schema/vendor_detailSchema')


const addDetail=(req,res)=>{
    const vendor_detail = new vendor_detailSchema(req.body)

     vendor_detail.save((err,data)=>{
        if(err){
            res.status(404).json({
                message:"error in Adding VendorDetails"
            })
        }else{
            res.status(200).json({
                message:"VendorDetails Added successfully...",
                data: data
            })
        }
     })
}


const getVendordetail=(req,res)=> {

        

    vendor_detailSchema.find().populate('userId').populate('cityId').populate('stateId').exec((err,data)=>{
   // vendor_detailSchema.find((err,data) => {
        if (err) {
            res.status(404).json({
                message: "VendorDetails not found...."
            })
        } else {
            res.status(200).json({
                message: "VendorDetails found successfully....",
                data:data
            })
        }
    })
}


const updateData=(req,res)=>{

    var id =req.params.id
    vendor_detailSchema.findByIdAndUpdate(id,(err,data)=>{
        if(err){
            res.status(500).json({
                message:"error in update VendorDetails ......."
            })
        }
        else(
            res.status(200).json({
                message:"VendorDetails Update Successfully......",
                data:data

            })
        )
    })
}
const getVendorById = (req, res) => {

    var id = req.params.id

    vendor_detailSchema.findById(id, (err, data) => {
        if (err) {
            res.status(404).json({
                message: "error in found VendorDetails..."
            })
        } else {
            res.status(200).json({
                message: "VendorDetails found successfully...",
                data: data
            })
 
        }
    })
}

const deleteVendor = (req, res) => {
    const id = req.params.id

    vendor_detailSchema.findByIdAndRemove(id, (err, success) => {
        if (err) {
            res.status(404).json({
                message: "error in removing User"
            })
        } else {
            res.status(200).json({
                message: "User remove successfully...",
                data: success
            })
        }
    })
}


module.exports={
    addDetail,
    getVendordetail,
    updateData,
    getVendorById,
    deleteVendor
}