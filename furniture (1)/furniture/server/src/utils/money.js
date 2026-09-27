// Prices are stored as integer paise (₹1 = 100 paise) so no rounding errors
// creep in. Convert only at the edges.
const toPaise = (rupees) => Math.round(Number(rupees) * 100)
const toRupees = (paise) => paise / 100

// Schema options for a money field stored in paise.
const paiseField = (options = {}) => ({
    type: Number,
    min: [0, 'Amount cannot be negative'],
    validate: { validator: Number.isInteger, message: 'Amount must be a whole number of paise' },
    ...options,
})

module.exports = { toPaise, toRupees, paiseField }
