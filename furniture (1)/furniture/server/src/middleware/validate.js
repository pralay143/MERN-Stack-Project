const ApiError = require('../utils/ApiError')

// Runs a Zod schema and turns failures into 400 { message, errors: { field: text } }.
function parse(schema, input) {
    const result = schema.safeParse(input ?? {})
    if (result.success) return { data: result.data }
    const errors = {}
    for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'body'
        errors[field] ??= issue.message
    }
    return { error: ApiError.badRequest('Validation failed', errors) }
}

// Validates req.body against a Zod schema and replaces it with the parsed
// result. Zod drops keys the schema doesn't list, so clients can't set
// fields like _id, role or user by adding them to the body.
const validate = (schema) => (req, res, next) => {
    const { data, error } = parse(schema, req.body)
    if (error) return next(error)
    req.body = data
    next()
}

// Validates the query string. The parsed values (with defaults and numbers
// converted) are put on req.validQuery; req.query is left as sent.
const validateQuery = (schema) => (req, res, next) => {
    const { data, error } = parse(schema, req.query)
    if (error) return next(error)
    req.validQuery = data
    next()
}

module.exports = validate
module.exports.validateQuery = validateQuery
