/** Send the standard success envelope. */
export function sendSuccess(res, data, { message, meta, statusCode = 200 } = {}) {
  const body = { success: true, data }
  if (message) body.message = message
  if (meta) body.meta = meta
  return res.status(statusCode).json(body)
}

/** Send the standard error envelope. Usually called by errorHandler middleware. */
export function sendError(res, { statusCode = 500, code = 'INTERNAL_SERVER_ERROR', message = 'An unexpected error occurred', details } = {}) {
  const error = { code, message }
  if (details !== undefined) error.details = details
  return res.status(statusCode).json({ success: false, error })
}
