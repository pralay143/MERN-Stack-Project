// Wraps an async route handler so a rejected promise reaches the error handler
// instead of becoming an unhandled rejection.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
