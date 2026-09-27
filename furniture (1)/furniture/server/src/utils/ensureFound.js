const ApiError = require('./ApiError')

// Returns the document, or throws a 404 naming the resource when it is null.
function ensureFound(doc, resourceName) {
    if (!doc) throw ApiError.notFound(`${resourceName} not found`)
    return doc
}

module.exports = ensureFound
