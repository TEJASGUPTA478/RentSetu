import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { billingMonthDate, getDueDate, getOverdueSummary } from '../../utils/paymentStatus.js'

const moneyNumber = value => Number(value ?? 0)
const monthStart = date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
const monthEnd = date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
const monthKey = date => date.toISOString().slice(0, 10)

/** Return a role-scoped portfolio summary using aggregate/count queries. */
export async function getLandlordDashboardData(user) {
  const propertyWhere = user.role === 'MANAGER' ? { managerId: user.id } : { ownerId: user.id }
  const properties = await prisma.property.findMany({ where: propertyWhere, select: { id: true } })
  const propertyIds = properties.map(property => property.id)
  const [totalProperties, totalUnits, occupiedUnits, vacantUnits] = await Promise.all([
    prisma.property.count({ where: propertyWhere }),
    prisma.unit.count({ where: { propertyId: { in: propertyIds } } }),
    prisma.unit.count({ where: { propertyId: { in: propertyIds }, status: 'OCCUPIED' } }),
    prisma.unit.count({ where: { propertyId: { in: propertyIds }, status: 'VACANT' } }),
  ])

  const now = new Date()
  const currentMonth = monthStart(now)
  const currentMonthEnd = monthEnd(now)
  const activeLeaseWhere = {
    status: 'ACTIVE',
    startDate: { lte: currentMonthEnd },
    endDate: { gte: currentMonth },
    unit: { propertyId: { in: propertyIds } },
  }
  const [portfolioLeases, expected, collected, overdue, openMaintenanceRequests] = await Promise.all([
    prisma.lease.findMany({ where: { unit: { propertyId: { in: propertyIds } } }, select: { id: true } }),
    prisma.lease.aggregate({ where: activeLeaseWhere, _sum: { monthlyRent: true } }),
    prisma.payment.aggregate({
      where: {
        paidOn: { gte: currentMonth, lte: currentMonthEnd },
        lease: { unit: { propertyId: { in: propertyIds } } },
      },
      _sum: { amount: true },
    }),
    prisma.lease.findMany({ where: { ...activeLeaseWhere, startDate: { lte: now } }, select: {
      id: true, startDate: true, endDate: true, dueDay: true, monthlyRent: true,
      tenant: { select: { user: { select: { id: true, name: true, email: true } } } },
      unit: { select: { unitNumber: true, property: { select: { id: true, name: true } } } },
    } }),
    prisma.maintenanceRequest.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, unit: { propertyId: { in: propertyIds } } },
    }),
  ])

  const { overdueCount, overdueAmount, overdueItems, outstandingItems } = await getOverdueSummary(prisma, overdue, now)
  const formatOutstandingItem = item => {
    const lease = overdue.find(candidate => candidate.id === item.leaseId)
    return { ...item, tenant: lease?.tenant.user.name || 'Tenant', tenantId: lease?.tenant.user.id, property: `${lease?.unit.property.name || 'Property'} · ${lease?.unit.unitNumber || ''}`, propertyId: lease?.unit.property.id }
  }
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))
  const leaseIds = portfolioLeases.map(lease => lease.id)
  const [monthlyGroups, recent] = await Promise.all([
    leaseIds.length ? prisma.payment.groupBy({
      by: ['billingMonth'],
      where: { leaseId: { in: leaseIds }, billingMonth: { gte: sixMonthsAgo, lte: currentMonth } },
      _sum: { amount: true },
      orderBy: { billingMonth: 'asc' },
    }) : [],
    prisma.payment.findMany({
      where: { lease: { unit: { propertyId: { in: propertyIds } } } },
      orderBy: [{ paidOn: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true, amount: true, billingMonth: true, paidOn: true, method: true,
        lease: {
          select: {
            tenant: { select: { user: { select: { id: true, name: true, email: true } } } },
            unit: { select: { unitNumber: true, property: { select: { id: true, name: true } } } },
            dueDay: true,
          },
        },
      },
    }),
  ])
  const monthTotals = new Map(monthlyGroups.map(group => [monthKey(group.billingMonth), moneyNumber(group._sum.amount)]))
  const rentCollectedByMonth = Array.from({ length: 6 }, (_, offset) => {
    const billingMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + offset, 1))
    return { billingMonth: monthKey(billingMonth), amount: monthTotals.get(monthKey(billingMonth)) ?? 0 }
  })

  return {
    totalProperties,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate: totalUnits ? Number(((occupiedUnits / totalUnits) * 100).toFixed(2)) : 0,
    rentCollectedThisMonth: moneyNumber(collected._sum.amount),
    expectedRentThisMonth: moneyNumber(expected._sum.monthlyRent),
    overdueCount,
    overdueAmount: Number(overdueAmount.toFixed(2)),
    overdueItems: overdueItems.map(formatOutstandingItem),
    outstandingItems: outstandingItems.map(formatOutstandingItem),
    openMaintenanceRequests,
    recentPayments: recent.map(payment => {
      const dueDate = getDueDate(payment.billingMonth.getUTCFullYear(), payment.billingMonth.getUTCMonth(), payment.lease.dueDay)
      return {
        id: payment.id,
        tenantId: payment.lease.tenant.user.id,
        tenant: payment.lease.tenant.user.name,
        tenantEmail: payment.lease.tenant.user.email,
        propertyId: payment.lease.unit.property.id,
        property: `${payment.lease.unit.property.name} · ${payment.lease.unit.unitNumber}`,
        unit: payment.lease.unit.unitNumber,
        amount: moneyNumber(payment.amount),
        billingMonth: monthKey(payment.billingMonth),
        due: monthKey(dueDate),
        paid: monthKey(payment.paidOn),
        paidOn: monthKey(payment.paidOn),
        status: 'Paid',
        method: payment.method,
      }
    }),
    rentCollectedByMonth,
  }
}

/** Return the signed-in tenant's current lease and payment summary. */
export async function getTenantDashboardData(user) {
  const profile = await prisma.tenantProfile.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (!profile) throw ApiError.notFound('Tenant profile not found')

  const today = new Date()
  const currentMonth = billingMonthDate(today)
  const [lease, openMaintenanceRequestCount] = await Promise.all([
    prisma.lease.findFirst({
      where: { tenantId: profile.id, status: 'ACTIVE', startDate: { lte: today }, endDate: { gte: today } },
      orderBy: { startDate: 'desc' },
      select: {
        id: true, startDate: true, endDate: true, monthlyRent: true, dueDay: true,
        unit: { select: { id: true, unitNumber: true, property: { select: { id: true, name: true, address: true, city: true, state: true } } } },
      },
    }),
    prisma.maintenanceRequest.count({ where: { tenantId: profile.id, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ])

  if (!lease) return { activeLease: null, monthlyRent: 0, nextDueDate: null, currentMonthStatus: 'PENDING', lastPayment: null, openMaintenanceRequestCount }

  const [currentPayment, lastPayment] = await Promise.all([
    prisma.payment.findUnique({ where: { leaseId_billingMonth: { leaseId: lease.id, billingMonth: currentMonth } }, select: { id: true, amount: true, billingMonth: true, paidOn: true, method: true } }),
    prisma.payment.findFirst({ where: { leaseId: lease.id }, orderBy: [{ paidOn: 'desc' }, { createdAt: 'desc' }], select: { id: true, amount: true, billingMonth: true, paidOn: true, method: true } }),
  ])
  const dueDateThisMonth = getDueDate(today.getUTCFullYear(), today.getUTCMonth(), lease.dueDay)
  const nextDueDate = dueDateThisMonth >= new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    ? dueDateThisMonth
    : getDueDate(today.getUTCFullYear(), today.getUTCMonth() + 1, lease.dueDay)
  const currentMonthStatus = currentPayment ? 'PAID' : dueDateThisMonth < new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) ? 'OVERDUE' : 'PENDING'

  return {
    activeLease: {
      id: lease.id,
      unitId: lease.unit.id,
      unit: lease.unit.unitNumber,
      propertyId: lease.unit.property.id,
      property: lease.unit.property.name,
      address: [lease.unit.property.address, lease.unit.property.city, lease.unit.property.state].filter(Boolean).join(', '),
      startDate: monthKey(lease.startDate),
      endDate: monthKey(lease.endDate),
    },
    monthlyRent: moneyNumber(lease.monthlyRent),
    nextDueDate: nextDueDate.toISOString().slice(0, 10),
    currentMonthStatus,
    lastPayment: lastPayment ? {
      id: lastPayment.id,
      amount: moneyNumber(lastPayment.amount),
      billingMonth: monthKey(lastPayment.billingMonth),
      paidOn: monthKey(lastPayment.paidOn),
      method: lastPayment.method,
    } : null,
    openMaintenanceRequestCount,
  }
}
