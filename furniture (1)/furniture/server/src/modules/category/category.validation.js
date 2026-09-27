const { z, text, boolean } = require('../../utils/validators')

const create = z.object({
    categoryName: text('Category name', 100),
    isActive: boolean.optional(),
})

const update = create.partial()

module.exports = { create, update }
