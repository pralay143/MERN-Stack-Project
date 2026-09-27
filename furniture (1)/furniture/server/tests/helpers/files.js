const fs = require('fs')
const path = require('path')

// Smallest valid PNG (1x1 transparent pixel).
const PNG_1PX = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
)

const TEST_IMAGE_NAME = 'jest-test-image.png'

// Folders the upload code has written to over time. Test uploads are
// removed from all of them so test runs leave no files behind.
const UPLOAD_DIRS = [
    path.resolve(__dirname, '..', '..', 'uploads'),
    path.resolve(__dirname, '..', '..', '..', 'client', 'public', 'uploads'),
]

function removeTestUploads(extraDirs = []) {
    for (const dir of [...UPLOAD_DIRS, ...extraDirs]) {
        if (!fs.existsSync(dir)) continue
        for (const name of fs.readdirSync(dir)) {
            if (name.includes('jest-test-image')) fs.rmSync(path.join(dir, name))
        }
    }
}

module.exports = { PNG_1PX, TEST_IMAGE_NAME, removeTestUploads }
