const mongoose = require('mongoose')

const citySchema = new mongoose.Schema(
    {
        cityName: { type: String, required: true, trim: true },
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
    },
    { timestamps: true }
)

citySchema.index({ state: 1, cityName: 1 }, { unique: true })

module.exports = mongoose.model('City', citySchema)
