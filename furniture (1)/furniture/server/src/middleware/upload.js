const crypto = require('crypto')
const fs = require('fs')
const multer = require('multer')
const ApiError = require('../utils/ApiError')
const { uploadDir, maxUploadBytes } = require('../config/env')

// Accepted image types, with the extension used for the stored file and the
// leading bytes every real file of that type starts with.
const IMAGE_TYPES = {
    'image/jpeg': { ext: '.jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    'image/png': { ext: '.png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    'image/webp': { ext: '.webp', matches: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
}

fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: uploadDir,
    // A random name with an extension chosen by us, never the client's name,
    // so uploads can't overwrite each other or pick an executable extension.
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + IMAGE_TYPES[file.mimetype].ext),
})

const acceptImagesOnly = (req, file, cb) => {
    if (IMAGE_TYPES[file.mimetype]) return cb(null, true)
    cb(ApiError.badRequest('Only JPEG, PNG or WebP images are allowed'))
}

const receiveImage = multer({
    storage,
    fileFilter: acceptImagesOnly,
    limits: { fileSize: maxUploadBytes, files: 1, fields: 20 },
}).single('file')

// The declared type comes from the client, so check the file's first bytes
// too. A mismatch (e.g. an HTML page named .png) is deleted and rejected.
async function verifyImageContent(req, res, next) {
    if (!req.file) return next()
    const handle = await fs.promises.open(req.file.path, 'r')
    try {
        const { buffer } = await handle.read(Buffer.alloc(12), 0, 12, 0)
        if (!IMAGE_TYPES[req.file.mimetype].matches(buffer)) {
            return next(ApiError.badRequest('The file is not a valid image'))
        }
        next()
    } catch (err) {
        next(err)
    } finally {
        await handle.close()
    }
}

// One image in the multipart field "file".
const uploadImage = [receiveImage, verifyImageContent]

module.exports = { uploadImage, IMAGE_TYPES }
