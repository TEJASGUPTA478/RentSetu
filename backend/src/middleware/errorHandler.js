import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { sendError } from '../utils/response.js'

function prismaUniqueMessage(error) {
  const target = error.meta?.target
  const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : []
  return fields.length ? `A record with this ${fields.join(', ')} already exists` : 'A record with these details already exists'
}

/** Normalize known application, validation, Prisma, and JWT errors. */
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error instanceof ZodError) {
    return sendError(res, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message })),
    })
  }
  if (error instanceof ApiError) {
    return sendError(res, { statusCode: error.statusCode, code: error.code, message: error.message, details: error.details })
  }
  if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
    return sendError(res, { statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired bearer token' })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, code: 'CONFLICT', message: prismaUniqueMessage(error) })
    if (error.code === 'P2025') return sendError(res, { statusCode: 404, code: 'NOT_FOUND', message: 'The requested record was not found' })
    if (error.code === 'P2003') return sendError(res, { statusCode: 409, code: 'RELATED_RECORD_EXISTS', message: 'The record is referenced by related data and cannot be changed or deleted' })
  }

  if (env.NODE_ENV !== 'production') console.error(error)
  return sendError(res, {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message || 'An unexpected error occurred',
  })
}
