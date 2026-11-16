/** Validate and replace selected request sections with their parsed Zod values. */
export function validate({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      if (body) req.body = body.parse(req.body)
      if (params) req.params = params.parse(req.params)
      if (query) {
        const parsed = query.parse(req.query)
        Object.defineProperty(req, 'query', { configurable: true, enumerable: true, value: parsed })
      }
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
