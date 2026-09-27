const ApiError = require('../utils/ApiError')

// Validates req.body against a Zod schema and replaces it with the parsed
// result. Zod drops keys the schema doesn't list, so clients can't set
// fields like _id, role or user by adding them to the body.
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {})
    if (!result.success) {
        const errors = {}
        for (const issue of result.error.issues) {
            const field = issue.path.join('.') || 'body'
            errors[field] ??= issue.message
        }
        return next(ApiError.badRequest('Validation failed', errors))
    }
    req.body = result.data
    next()
}

module.exports = validate
