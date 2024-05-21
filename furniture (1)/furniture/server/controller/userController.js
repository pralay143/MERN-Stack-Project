const userSchema = require('../schema/userSchema')

const addUser = (req, res) => {

    const user = new userSchema(req.body)

    user.save((err, data) => {
        if (err) {
            res.status(404).json({
                message: "error in adding User..."
            })
        } else {
            res.status(200).json({
                message: "User added successfully...",
                data: data
            })
        }
    })
}

const getUser = (req, res) => {

    userSchema.find().populate('role').exec((err,users) => {
        if (err) {
            res.status(404).json({
                message: "User not found...."
            })
        } else {
            res.status(200).json({
                message: "User found successfully....",
                data:users
            })
        }
    })
}

const getUserById = (req, res) => {

    var id = req.params.id

    userSchema.findById(id,(err, data) => {
        if (err) {
            res.status(404).json({ 
                message: "error in found User.."
            })
        } else {
            res.status(200).json({
                message: "User found successfully...",
                data: data
            })
 
        }
    })
}



const updateUser = (req, res) => {
    const id = req.params.id

    userSchema.findByIdAndUpdate(id, (err, success) => {
        if (err) {
            res.status(404).json({
                message: "error in updating User"
            })
        } else {
            res.status(200).json({
                message: "User upadate successfully...",
                data: success
            })
        }
    })
}

const deleteUser = (req, res) => {
    const id = req.params.id

    userSchema.findByIdAndRemove(id, (err, success) => {
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


const loginUser = (req,res)=>{


    var email = req.body.email
    var password = req.body.password  

    if(email!=undefined && password!= undefined && email!= "" && password!=""){
        userSchema.find({email:email,password:password}).populate('role').exec((err,data)=>{

            if(err){
                res.status(500).json({
                    message:"error while fetching User"
                })
            }
            else{
                if(data!=undefined && data!=null && data.length>0){
                    res.status(200).json({
                        message:"user found",
                        data:data
                    })
                }
                else{
                    res.status(404).json({
                        message:"User not found"
                    })
                }
            }
        })
    

    }
    else{
        res.status(404).json({
            message:"email and password both are required"
        })
    }


}
















module.exports = {
    addUser,
    getUser,
    getUserById,
    updateUser,
    deleteUser,
    loginUser
}