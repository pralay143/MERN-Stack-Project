const City = require('./city.model')

const create = (data) => City.create(data)

const list = () => City.find().populate('state')

module.exports = { create, list }
