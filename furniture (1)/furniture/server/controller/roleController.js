const roleSchema = require('../schema/roleSchema')


const addRole = (req, res) => {
    const role = new roleSchema(req.body)
    role.save((err, data) => {
        if (err) {
            res.status(404).json({
                message: "error in adding Role..."
            })
        } else {
            res.status(200).json({
                message: "Role added successfully...",
                data: data
            })
        }
    })
}


const getRole = (req, res) => {
    roleSchema.find((err, data) => {
        if (err) {
            res.status(404).json({
                message: "Role not found"
            })
        } else {
            res.status(200).json({
                message: "Role found successfully.......",
                data: data
            })
        }
    })
}




module.exports = {
    addRole,
    getRole
}