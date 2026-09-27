const { z, text, objectId } = require('../../utils/validators')

const createState = z.object({ stateName: text('State name', 100) })

const createCity = z.object({
    cityName: text('City name', 100),
    state: objectId('State'),
})

module.exports = { createState, createCity }
