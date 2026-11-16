/** HTTP error with a stable API error code and optional structured details. */
export class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Error.captureStackTrace?.(this, this.constructor)
  }

  static badRequest(message = 'Bad request', details) { return new ApiError(400, 'BAD_REQUEST', message, details) }
  static unauthorized(message = 'Authentication required') { return new ApiError(401, 'UNAUTHORIZED', message) }
  static forbidden(message = 'You do not have permission to perform this action') { return new ApiError(403, 'FORBIDDEN', message) }
  static notFound(message = 'Resource not found') { return new ApiError(404, 'NOT_FOUND', message) }
  static conflict(message = 'Resource conflict', details) { return new ApiError(409, 'CONFLICT', message, details) }
}
