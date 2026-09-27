const Role = require('./role.model')

const create = (data) => Role.create(data)

const list = () => Role.find()

module.exports = { create, list }
