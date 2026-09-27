const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { bcryptRounds } = require('../../config/env')

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        // Never returned by queries unless asked for with .select('+password').
        password: { type: String, required: true, select: false },
        gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
        contactNum: { type: String, trim: true },
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    },
    {
        timestamps: true,
        // Second safeguard: strip the password even if a query selected it.
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password
                return ret
            },
        },
    }
)

const hashPassword = (plain) => bcrypt.hash(plain, bcryptRounds)

// Hash on create and whenever the password changes through save().
userSchema.pre('save', async function () {
    if (this.isModified('password')) this.password = await hashPassword(this.password)
})

// Hash passwords set through findOneAndUpdate / findByIdAndUpdate too, so a
// plain-text password can never reach the database.
userSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate()
    const target = update.$set && update.$set.password !== undefined ? update.$set : update
    if (target.password !== undefined) target.password = await hashPassword(target.password)
})

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)
