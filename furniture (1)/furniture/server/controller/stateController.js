const stateSchema = require('../schema/stateSchema')
const stateController=require('../schema/stateSchema')

const addState=(req,res)=>{
  const  state= new stateSchema(req.body)

  state.save((err,data)=>{
    if(err){
        res.status(404).json({
            message:"error in adding State...."
        })
    }else{
        res.status(200).json({
            message:"State added successfully....",
            data:data
        })
    }
  })
}


const getstate=(req,res)=>{

    stateSchema.find((err, data) => {
        if (err) {
            res.status(404).json({
                message: "State not found...."
            })
        } else {
            res.status(200).json({
                message: "State found successfully....",
                data: data
            })
        }
    })
}

module.exports={
    addState,
    getstate
}