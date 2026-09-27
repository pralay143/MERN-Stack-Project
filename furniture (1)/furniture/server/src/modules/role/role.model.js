const mongoose = require('mongoose')

const ROLES = ['Admin', 'Vendor', 'Customer']

const roleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, enum: ROLES },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Role', roleSchema)
module.exports.ROLES = ROLES
