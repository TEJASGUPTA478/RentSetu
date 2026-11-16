/** Convert a date-like value to its UTC first-of-month billing key. */
export function billingMonthDate(value) {
  const date = new Date(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

/** Return the UTC date for a lease's scheduled monthly rent due day. */
export function getDueDate(year, monthIndex, dueDay) {
  return new Date(Date.UTC(year, monthIndex, dueDay))
}

/**
 * Calculate missing due months for active leases. Payments are selected as
 * only lease/month keys so callers do not load payment records into memory.
 */
export async function getOverdueSummary(prisma, leases, asOf = new Date()) {
  if (!leases.length) return { overdueCount: 0, overdueAmount: 0, overdueItems: [] }

  const today = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()))
  const firstCurrentMonth = billingMonthDate(today)
  const earliest = leases.reduce((date, lease) => lease.startDate < date ? lease.startDate : date, leases[0].startDate)
  const payments = await prisma.payment.findMany({
    where: {
      leaseId: { in: leases.map(lease => lease.id) },
      billingMonth: { gte: billingMonthDate(earliest), lte: firstCurrentMonth },
    },
    select: { leaseId: true, billingMonth: true },
  })
  const paidKeys = new Set(payments.map(payment => `${payment.leaseId}:${billingMonthDate(payment.billingMonth).toISOString()}`))
  const overdueItems = []

  for (const lease of leases) {
    const start = billingMonthDate(lease.startDate)
    const endDate = lease.endDate ? new Date(lease.endDate) : today
    const lastMonth = billingMonthDate(endDate < today ? endDate : today)
    for (let month = new Date(start); month <= lastMonth; month = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1))) {
      const dueDate = getDueDate(month.getUTCFullYear(), month.getUTCMonth(), lease.dueDay)
      const key = `${lease.id}:${month.toISOString()}`
      if (dueDate < today && !paidKeys.has(key)) {
        overdueItems.push({ leaseId: lease.id, billingMonth: new Date(month), dueDate, amount: Number(lease.monthlyRent) })
      }
    }
  }

  return {
    overdueCount: overdueItems.length,
    overdueAmount: overdueItems.reduce((total, item) => total + item.amount, 0),
    overdueItems,
  }
}
