/** Wrap an async Express handler and pass rejected promises to error middleware. */
export const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
