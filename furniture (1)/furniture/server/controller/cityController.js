const citySchema=require('../schema/citySchema')



const addCity=(req,res)=>{
    const city= new citySchema(req.body)

    city.save((err,data)=>{
        if(err){
            res.status(404).json({
                message:"error in adding City..."
            })
        }else{
            res.status(200).json({
                message:"City added successfully....",
                data:data
            })
        }
    }) 
}

const getcity=(req,res)=>{

    citySchema.find().populate('state').exec((err, data) => {
        if (err) {
            res.status(404).json({
                message: "City not found...."
            })
        } else {
            res.status(200).json({
                message: "City found successfully....",
                data: data
            })
        }
    })
}


module.exports={
    addCity,
    getcity
}