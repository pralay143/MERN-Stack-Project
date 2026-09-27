const path = require('path')
require('dotenv').config({ quiet: true })

const SERVER_ROOT = path.resolve(__dirname, '..', '..')

module.exports = {
    mongoUri: process.env.MONGO_URI,
    port: process.env.PORT || 3550,

    // General file uploads (POST /upload/upload).
    uploadDir: path.join(SERVER_ROOT, 'uploads'),

    // Product images are still written into the CRA client's public folder,
    // because the current client displays them from /uploads/<name>.
    productImageDir: path.resolve(SERVER_ROOT, '..', 'client', 'public', 'uploads'),
}
