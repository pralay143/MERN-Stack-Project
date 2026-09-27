const fs = require('fs')
const { uploadDir } = require('../../src/config/env')

// Smallest valid PNG (1x1 transparent pixel).
const PNG_1PX = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
)

const TEST_IMAGE_NAME = 'jest-test-image.png'

// Files currently in this worker's temporary upload folder.
const uploadedFiles = () => (fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [])

// Empties this worker's temporary upload folder (tests/setup/env.js points
// UPLOAD_DIR at a temp folder, never at server/uploads).
function removeTestUploads() {
    if (!uploadDir.includes('efurniture-test-uploads')) throw new Error(`Refusing to clean ${uploadDir}`)
    fs.rmSync(uploadDir, { recursive: true, force: true })
}

module.exports = { PNG_1PX, TEST_IMAGE_NAME, uploadedFiles, removeTestUploads }
