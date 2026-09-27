const { z } = require('../../utils/validators')
const { ROLES } = require('./role.model')

const create = z.object({ name: z.enum(ROLES, `Role must be one of: ${ROLES.join(', ')}`) })

module.exports = { create }
