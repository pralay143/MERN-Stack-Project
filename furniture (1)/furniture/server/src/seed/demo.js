const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Brand = require('../modules/brand/brand.model')
const Category = require('../modules/category/category.model')
const Product = require('../modules/product/product.model')
const User = require('../modules/user/user.model')
const { uploadDir } = require('../config/env')
const { brands, products } = require('./demoData')

const IMAGE_DIR = path.join(__dirname, 'demo-images')
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }

// Copies a demo image into the upload folder under a random name, the same
// way real uploads are stored, and returns the product's file field.
function storeImage(fileName) {
    const ext = path.extname(fileName).toLowerCase()
    const stored = crypto.randomUUID() + (ext === '.jpeg' ? '.jpg' : ext)
    fs.mkdirSync(uploadDir, { recursive: true })
    fs.copyFileSync(path.join(IMAGE_DIR, fileName), path.join(uploadDir, stored))
    return { name: fileName, size: fs.statSync(path.join(IMAGE_DIR, fileName)).size, url: `/uploads/${stored}`, type: MIME[ext] }
}

// Adds the sample brands and products. Needs the categories and an admin
// user from seed(). Safe to run again: existing products (by name) are left
// alone and their images aren't copied twice. Returns how many were added.
async function seedDemo({ ownerEmail = 'admin@efurniture.local' } = {}) {
    const owner = await User.findOne({ email: ownerEmail.toLowerCase() })
    if (!owner) throw new Error(`Demo products need the admin user ${ownerEmail}; run the normal seed first`)

    const categoryIds = Object.fromEntries((await Category.find()).map((c) => [c.categoryName, c._id]))
    const brandIds = {}
    for (const brandName of brands) {
        const brand = await Brand.findOneAndUpdate({ brandName }, { $setOnInsert: { brandName } }, { upsert: true, new: true })
        brandIds[brandName] = brand._id
    }

    let added = 0
    // Older products first, so "newest" puts the end of the list on top.
    for (const [index, item] of products.entries()) {
        if (await Product.exists({ productName: item.productName })) continue
        if (!categoryIds[item.category]) throw new Error(`Unknown category "${item.category}"; run the normal seed first`)

        await Product.create({
            productName: item.productName,
            description: item.description,
            price: item.price,
            categoryId: categoryIds[item.category],
            brandId: brandIds[item.brand],
            user: owner._id,
            file: storeImage(item.image),
            createdAt: new Date(Date.now() - (products.length - index) * 60_000),
        })
        added++
    }
    return { brands: brands.length, products: added }
}

module.exports = { seedDemo }
