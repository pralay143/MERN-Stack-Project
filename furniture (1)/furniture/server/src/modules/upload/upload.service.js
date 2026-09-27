const FileUpload = require('./upload.model')

const create = (data) => FileUpload.create(data)

module.exports = { create }
