import { ApiError } from '../utils/ApiError.js'

/** Convert unmatched Express routes into the standard 404 error response. */
export function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}
