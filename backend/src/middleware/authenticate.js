import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

/** Attach the verified user identity required by downstream route handlers. */
export function authenticate(req, res, next) {
  const authorization = req.get('authorization')
  if (authorization) {
    if (!authorization.startsWith('Bearer ')) return next(ApiError.unauthorized('Expected a Bearer token'))
    try {
      const payload = jwt.verify(authorization.slice(7), env.JWT_SECRET)
      const id = typeof payload === 'object' ? payload.id ?? payload.sub : undefined
      const role = typeof payload === 'object' ? payload.role : undefined
      if (!id || !role) throw new ApiError(401, 'UNAUTHORIZED', 'Token is missing a user identity')
      req.user = { id, role, email: payload.email }
      return next()
    } catch (error) {
      return next(error instanceof ApiError ? error : ApiError.unauthorized('Invalid or expired bearer token'))
    }
  }

  // Development header fallback for testing and seed demo requests
  if (env.NODE_ENV === 'development') {
    const id = req.get('x-dev-user-id')
    const role = req.get('x-dev-user-role')
    if (id && ['LANDLORD', 'MANAGER', 'TENANT'].includes(role)) {
      req.user = { id, role, email: req.get('x-dev-user-email') }
      return next()
    }
  }

  return next(ApiError.unauthorized())
}
