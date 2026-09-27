const { z, text, objectId, boolean } = require('../../utils/validators')

const create = z.object({
    subcategoryName: text('Subcategory name', 100),
    categoryDetail: objectId('Category'),
    isActive: boolean.optional(),
})

const update = create.partial()

module.exports = { create, update }
