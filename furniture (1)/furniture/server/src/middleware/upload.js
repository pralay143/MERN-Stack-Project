const fs = require('fs')
const multer = require('multer')
const { uploadDir, productImageDir } = require('../config/env')

const MAX_FILE_SIZE = 9000000 // bytes

// Accepts one file in the multipart field "file" and saves it to `destination`
// under its original name.
function singleFileUpload(destination) {
    fs.mkdirSync(destination, { recursive: true })

    const storage = multer.diskStorage({
        destination,
        filename: (req, file, cb) => cb(null, file.originalname),
    })

    return multer({ storage, limits: { fileSize: MAX_FILE_SIZE } }).single('file')
}

module.exports = {
    uploadFile: singleFileUpload(uploadDir),
    uploadProductImage: singleFileUpload(productImageDir),
}
