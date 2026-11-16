/** Parse common Express query values into a bounded Prisma pagination window. */
export function parsePagination(query = {}) {
  const requestedPage = Number.parseInt(query.page, 10)
  const requestedLimit = Number.parseInt(query.limit, 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10
  return { page, limit, skip: (page - 1) * limit, take: limit }
}

/** Build paging metadata for the standard response envelope. */
export function buildMeta(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) }
}
