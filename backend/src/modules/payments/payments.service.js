import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'
import { billingMonthDate, getDueDate } from '../../utils/paymentStatus.js'

function getRolePaymentFilter(user) {
  if (user.role === 'LANDLORD') {
    return { lease: { unit: { property: { ownerId: user.id } } } }
  }
  if (user.role === 'MANAGER') {
    return { lease: { unit: { property: { managerId: user.id } } } }
  }
  if (user.role === 'TENANT') {
    return { lease: { tenant: { userId: user.id } } }
  }
  throw ApiError.forbidden('Access denied')
}

export function formatPayment(payment) {
  const dueDate = payment.lease?.dueDay && payment.billingMonth
    ? getDueDate(payment.billingMonth.getUTCFullYear(), payment.billingMonth.getUTCMonth(), payment.lease.dueDay)
    : null

  const formatted = {
    id: payment.id,
    leaseId: payment.leaseId,
    billingMonth: payment.billingMonth.toISOString().slice(0, 10),
    amount: Number(payment.amount),
    method: payment.method,
    paidOn: payment.paidOn.toISOString().slice(0, 10),
    notes: payment.notes,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    due: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    paid: payment.paidOn.toISOString().slice(0, 10),
    status: 'Paid',
  }

  if (payment.lease) {
    formatted.lease = {
      id: payment.lease.id,
      startDate: payment.lease.startDate,
      endDate: payment.lease.endDate,
      monthlyRent: Number(payment.lease.monthlyRent),
      dueDay: payment.lease.dueDay,
      status: payment.lease.status,
      unit: payment.lease.unit ? {
        id: payment.lease.unit.id,
        unitNumber: payment.lease.unit.unitNumber,
        property: payment.lease.unit.property ? {
          id: payment.lease.unit.property.id,
          name: payment.lease.unit.property.name,
          address: payment.lease.unit.property.address,
          city: payment.lease.unit.property.city,
        } : undefined,
      } : undefined,
      tenant: payment.lease.tenant ? {
        id: payment.lease.tenant.id,
        phone: payment.lease.tenant.phone,
        user: payment.lease.tenant.user ? {
          id: payment.lease.tenant.user.id,
          name: payment.lease.tenant.user.name,
          email: payment.lease.tenant.user.email,
        } : undefined,
      } : undefined,
    }

    if (payment.lease.tenant?.user?.name) {
      formatted.tenant = payment.lease.tenant.user.name
      formatted.tenantId = payment.lease.tenant.user.id
      formatted.tenantEmail = payment.lease.tenant.user.email
    }
    if (payment.lease.unit) {
      formatted.unit = payment.lease.unit.unitNumber
      if (payment.lease.unit.property) {
        formatted.property = `${payment.lease.unit.property.name} · ${payment.lease.unit.unitNumber}`
        formatted.propertyId = payment.lease.unit.property.id
      }
    }
  }

  return formatted
}

export async function listPayments(user, query = {}) {
  const roleFilter = getRolePaymentFilter(user)
  const where = { ...roleFilter }

  if (query.leaseId) {
    where.leaseId = query.leaseId
  }

  if (query.propertyId) {
    where.lease = {
      ...(where.lease || {}),
      unit: {
        ...(where.lease?.unit || {}),
        propertyId: query.propertyId,
      },
    }
  }

  if (query.tenantId) {
    where.lease = {
      ...(where.lease || {}),
      tenantId: query.tenantId,
    }
  }

  if (query.method) {
    where.method = query.method
  }

  if (query.billingMonth) {
    where.billingMonth = billingMonthDate(query.billingMonth)
  }

  if (query.startDate || query.endDate) {
    where.paidOn = {}
    if (query.startDate) where.paidOn.gte = query.startDate
    if (query.endDate) where.paidOn.lte = query.endDate
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: [{ paidOn: 'desc' }, { createdAt: 'desc' }],
      include: {
        lease: {
          select: {
            id: true,
            dueDay: true,
            monthlyRent: true,
            startDate: true,
            endDate: true,
            status: true,
            unit: {
              select: {
                id: true,
                unitNumber: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                    city: true,
                  },
                },
              },
            },
            tenant: {
              select: {
                id: true,
                phone: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  return {
    payments: payments.map(formatPayment),
    meta: buildMeta(total, page, limit),
  }
}

export async function getPaymentById(user, id) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenant: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!payment) {
    throw ApiError.notFound('Payment not found')
  }

  if (user.role === 'LANDLORD' && payment.lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this payment')
  }

  if (user.role === 'MANAGER' && payment.lease.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this payment')
  }

  if (user.role === 'TENANT' && payment.lease.tenant.userId !== user.id) {
    throw ApiError.forbidden('You do not have access to this payment')
  }

  return formatPayment(payment)
}

export async function recordPayment(user, data) {
  if (user.role !== 'LANDLORD' && user.role !== 'MANAGER') {
    throw ApiError.forbidden('Only landlords and managers can record payments')
  }

  const lease = await prisma.lease.findUnique({
    where: { id: data.leaseId },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      tenant: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!lease) {
    throw ApiError.notFound('Lease not found')
  }

  if (user.role === 'LANDLORD' && lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to record payments for this lease')
  }

  if (user.role === 'MANAGER' && lease.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to record payments for this lease')
  }

  const normalizedBillingMonth = billingMonthDate(data.billingMonth)

  const existingPayment = await prisma.payment.findUnique({
    where: {
      leaseId_billingMonth: {
        leaseId: data.leaseId,
        billingMonth: normalizedBillingMonth,
      },
    },
  })

  if (existingPayment) {
    throw ApiError.conflict('A payment has already been recorded for this lease and billing month')
  }

  const paidOn = data.paidOn ? new Date(data.paidOn) : new Date()

  try {
    const payment = await prisma.payment.create({
      data: {
        leaseId: data.leaseId,
        billingMonth: normalizedBillingMonth,
        amount: data.amount,
        method: data.method,
        paidOn,
        notes: data.notes || null,
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    return formatPayment(payment)
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('A payment has already been recorded for this lease and billing month')
    }
    throw error
  }
}

export async function updatePayment(user, id, data) {
  if (user.role !== 'LANDLORD' && user.role !== 'MANAGER') {
    throw ApiError.forbidden('Only landlords and managers can update payments')
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenant: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })

  if (!payment) {
    throw ApiError.notFound('Payment not found')
  }

  if (user.role === 'LANDLORD' && payment.lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this payment')
  }

  if (user.role === 'MANAGER' && payment.lease.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this payment')
  }

  const updateData = {}
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.method !== undefined) updateData.method = data.method
  if (data.paidOn !== undefined) updateData.paidOn = new Date(data.paidOn)
  if (data.notes !== undefined) updateData.notes = data.notes

  if (data.billingMonth !== undefined) {
    const normalizedBillingMonth = billingMonthDate(data.billingMonth)
    if (normalizedBillingMonth.getTime() !== payment.billingMonth.getTime()) {
      const existing = await prisma.payment.findUnique({
        where: {
          leaseId_billingMonth: {
            leaseId: payment.leaseId,
            billingMonth: normalizedBillingMonth,
          },
        },
      })
      if (existing && existing.id !== id) {
        throw ApiError.conflict('A payment has already been recorded for this lease and billing month')
      }
      updateData.billingMonth = normalizedBillingMonth
    }
  }

  try {
    const updated = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    })

    return formatPayment(updated)
  } catch (error) {
    if (error.code === 'P2002') {
      throw ApiError.conflict('A payment has already been recorded for this lease and billing month')
    }
    throw error
  }
}
