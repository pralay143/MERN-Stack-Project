const { z, text, objectId } = require('../../utils/validators')

const create = z.object({
    brandName: text('Brand name', 100),
    categoryId: objectId('Category').optional(),
})

const update = create.partial()

module.exports = { create, update }
