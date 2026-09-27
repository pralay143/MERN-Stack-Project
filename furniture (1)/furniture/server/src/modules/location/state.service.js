const State = require('./state.model')

const create = (data) => State.create(data)

const list = () => State.find()

module.exports = { create, list }
