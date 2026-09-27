const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
        contactNum: { type: String, trim: true },
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    },
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
