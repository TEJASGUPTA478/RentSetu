import { ApiError } from '../utils/ApiError.js'

/** Restrict a route to one or more authenticated roles. */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden())
    return next()
  }
}
