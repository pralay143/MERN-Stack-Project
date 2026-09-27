// Upload safety: image-only, content check, size limit, random names,
// storage under UPLOAD_DIR and how the files are served.
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const app = require('../src/app')
const db = require('./helpers/db')
const { loginAs } = require('./helpers/auth')
const { PNG_1PX, uploadedFiles, removeTestUploads } = require('./helpers/files')
const { uploadDir, maxUploadBytes } = require('../src/config/env')

const v1 = (path) => `/api/v1${path}`
const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
const WEBP_HEADER = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x24, 0, 0, 0]), Buffer.from('WEBPVP8 ')])

let vendor

beforeAll(async () => {
    await db.connect()
    vendor = await loginAs(app, 'Vendor')
})

afterAll(async () => {
    removeTestUploads()
    await db.close()
})

const upload = (buffer, filename, contentType) =>
    vendor.post(v1('/uploads')).attach('file', buffer, { filename, contentType })

// The error handler deletes rejected files asynchronously.
const settle = () => new Promise((resolve) => setTimeout(resolve, 100))

describe('accepted images', () => {
    test.each([
        ['PNG', PNG_1PX, 'image/png', '.png'],
        ['JPEG', JPEG_HEADER, 'image/jpeg', '.jpg'],
        ['WebP', WEBP_HEADER, 'image/webp', '.webp'],
    ])('%s is stored under a random name with our extension', async (_, buffer, type, ext) => {
        const res = await upload(buffer, 'holiday photo.PHP', type)
        expect(res.status).toBe(201)
        const url = res.body.data.url
        expect(url).toMatch(new RegExp(`^/uploads/[0-9a-f-]{36}\\${ext}$`))
        expect(fs.existsSync(path.join(uploadDir, path.basename(url)))).toBe(true)
    })

    test('the response has a public URL, not a path on the server', async () => {
        const res = await upload(PNG_1PX, 'a.png', 'image/png')
        expect(res.body.data.url.startsWith('/uploads/')).toBe(true)
        expect(JSON.stringify(res.body)).not.toContain(uploadDir.replace(/\\/g, '\\\\'))
    })

    test('two uploads with the same name never overwrite each other', async () => {
        const first = await upload(PNG_1PX, 'same.png', 'image/png')
        const second = await upload(PNG_1PX, 'same.png', 'image/png')
        expect(first.body.data.url).not.toBe(second.body.data.url)
    })
})

describe('rejected files', () => {
    test('non-image types are refused before anything is saved', async () => {
        const before = uploadedFiles().length
        const res = await upload(Buffer.from('<script>alert(1)</script>'), 'page.html', 'text/html')
        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/Only JPEG, PNG or WebP/)
        await settle()
        expect(uploadedFiles().length).toBe(before)
    })

    test('a file whose content is not really an image is deleted', async () => {
        const before = uploadedFiles().length
        const res = await upload(Buffer.from('<html><script>alert(1)</script></html>'), 'fake.png', 'image/png')
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('The file is not a valid image')
        await settle()
        expect(uploadedFiles().length).toBe(before)
    })

    test('files over the size limit get 413', async () => {
        const tooBig = Buffer.concat([PNG_1PX, Buffer.alloc(maxUploadBytes + 1)])
        const res = await upload(tooBig, 'huge.png', 'image/png')
        expect(res.status).toBe(413)
        expect(res.body.message).toMatch(/at most 1 MB/)
    })

    test('only one file per request', async () => {
        const res = await vendor
            .post(v1('/uploads'))
            .attach('file', PNG_1PX, { filename: 'a.png', contentType: 'image/png' })
            .attach('file', PNG_1PX, { filename: 'b.png', contentType: 'image/png' })
        expect(res.status).toBe(400)
    })

    test('product images go through the same checks', async () => {
        const res = await vendor
            .post(v1('/products'))
            .field('productName', 'Sofa')
            .attach('file', Buffer.from('not an image'), { filename: 'sofa.png', contentType: 'image/png' })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('The file is not a valid image')
    })
})

describe('serving uploads', () => {
    let url

    beforeAll(async () => {
        url = (await upload(PNG_1PX, 'served.png', 'image/png')).body.data.url
    })

    test('uploaded images are served by the API with safe headers', async () => {
        const res = await request(app).get(url)
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toBe('image/png')
        expect(res.headers['x-content-type-options']).toBe('nosniff')
        expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin')
        expect(res.headers['cache-control']).toMatch(/immutable/)
    })

    test('the cross-origin header is only relaxed for /uploads', async () => {
        const res = await request(app).get(v1('/categories'))
        expect(res.headers['cross-origin-resource-policy']).toBe('same-origin')
    })

    test('paths outside the upload folder are not reachable', async () => {
        for (const p of ['/uploads/../package.json', '/uploads/%2e%2e/package.json', '/uploads/..%2fpackage.json']) {
            const res = await request(app).get(p)
            expect(res.status).toBe(404)
            expect(res.text).not.toContain('"dependencies"')
        }
    })

    test('uploads are stored in UPLOAD_DIR, not in the client project', () => {
        expect(uploadDir).toContain('efurniture-test-uploads')
        expect(fs.existsSync(path.join(uploadDir, path.basename(url)))).toBe(true)
    })
})
