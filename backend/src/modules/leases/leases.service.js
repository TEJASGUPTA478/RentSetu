import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'

function getRoleLeaseFilter(user) {
  if (user.role === 'LANDLORD') {
    return { unit: { property: { ownerId: user.id } } }
  }
  if (user.role === 'MANAGER') {
    return { unit: { property: { managerId: user.id } } }
  }
  if (user.role === 'TENANT') {
    return { tenant: { userId: user.id } }
  }
  throw ApiError.forbidden('Access denied')
}

export async function listLeases(user, query = {}) {
  const roleFilter = getRoleLeaseFilter(user)
  const where = { ...roleFilter }

  if (query.propertyId) {
    where.unit = {
      ...(where.unit || {}),
      propertyId: query.propertyId,
    }
  }

  if (query.unitId) {
    where.unitId = query.unitId
  }

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  if (query.status) {
    where.status = query.status
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, leases] = await Promise.all([
    prisma.lease.count({ where }),
    prisma.lease.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            rent: true,
            bedrooms: true,
            status: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
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
    }),
  ])

  const formattedLeases = leases.map(lease => ({
    id: lease.id,
    unitId: lease.unitId,
    tenantId: lease.tenantId,
    startDate: lease.startDate,
    endDate: lease.endDate,
    monthlyRent: lease.monthlyRent,
    securityDeposit: lease.securityDeposit,
    dueDay: lease.dueDay,
    status: lease.status,
    createdAt: lease.createdAt,
    updatedAt: lease.updatedAt,
    unit: lease.unit,
    tenant: {
      id: lease.tenant.id,
      name: lease.tenant.user.name,
      email: lease.tenant.user.email,
      phone: lease.tenant.phone,
    },
  }))

  return {
    leases: formattedLeases,
    meta: buildMeta(total, page, limit),
  }
}

export async function getLeaseById(user, id) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
              pincode: true,
              type: true,
              ownerId: true,
              managerId: true,
            },
          },
        },
      },
      tenant: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      payments: {
        take: 10,
        orderBy: { paidOn: 'desc' },
      },
    },
  })

  if (!lease) {
    throw ApiError.notFound('Lease not found')
  }

  if (user.role === 'LANDLORD' && lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to view this lease')
  }

  if (user.role === 'MANAGER' && lease.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to view this lease')
  }

  if (user.role === 'TENANT' && lease.tenant.userId !== user.id) {
    throw ApiError.forbidden('You do not have permission to view this lease')
  }

  return {
    id: lease.id,
    unitId: lease.unitId,
    tenantId: lease.tenantId,
    startDate: lease.startDate,
    endDate: lease.endDate,
    monthlyRent: lease.monthlyRent,
    securityDeposit: lease.securityDeposit,
    dueDay: lease.dueDay,
    status: lease.status,
    createdAt: lease.createdAt,
    updatedAt: lease.updatedAt,
    unit: lease.unit,
    tenant: {
      id: lease.tenant.id,
      userId: lease.tenant.userId,
      name: lease.tenant.user.name,
      email: lease.tenant.user.email,
      phone: lease.tenant.phone,
    },
    payments: lease.payments,
  }
}

export async function createLease(user, data) {
  const unit = await prisma.unit.findUnique({
    where: { id: data.unitId },
    include: { property: true },
  })

  if (!unit) {
    throw ApiError.notFound('Unit not found')
  }

  if (user.role === 'LANDLORD' && unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to lease this unit')
  }

  if (user.role === 'MANAGER' && unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to lease this unit')
  }

  const tenant = await prisma.tenantProfile.findUnique({
    where: { id: data.tenantId },
  })

  if (!tenant) {
    throw ApiError.notFound('Tenant profile not found')
  }

  const status = data.status || 'ACTIVE'

  if (status === 'ACTIVE') {
    const activeLease = await prisma.lease.findFirst({
      where: {
        unitId: data.unitId,
        status: 'ACTIVE',
      },
    })

    if (activeLease) {
      throw ApiError.conflict('An active lease already exists for this unit. End or terminate it first.')
    }
  }

  return prisma.$transaction(async tx => {
    const lease = await tx.lease.create({
      data: {
        unitId: data.unitId,
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        monthlyRent: data.monthlyRent,
        securityDeposit: data.securityDeposit,
        dueDay: data.dueDay,
        status,
      },
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { id: true, name: true } },
          },
        },
        tenant: {
          select: {
            id: true,
            phone: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (status === 'ACTIVE') {
      await tx.unit.update({
        where: { id: data.unitId },
        data: { status: 'OCCUPIED' },
      })
    }

    return lease
  })
}

export async function updateLease(user, id, data) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
    },
  })

  if (!lease) {
    throw ApiError.notFound('Lease not found')
  }

  if (user.role === 'LANDLORD' && lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this lease')
  }

  if (user.role === 'MANAGER' && lease.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this lease')
  }

  const newStatus = data.status

  if (newStatus === 'ACTIVE' && lease.status !== 'ACTIVE') {
    const existingActive = await prisma.lease.findFirst({
      where: {
        unitId: lease.unitId,
        status: 'ACTIVE',
        id: { not: id },
      },
    })
    if (existingActive) {
      throw ApiError.conflict('Another active lease already exists for this unit')
    }
  }

  return prisma.$transaction(async tx => {
    const updated = await tx.lease.update({
      where: { id },
      data,
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { id: true, name: true } },
          },
        },
        tenant: {
          select: {
            id: true,
            phone: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (newStatus && newStatus !== lease.status) {
      if (newStatus === 'ACTIVE') {
        await tx.unit.update({
          where: { id: lease.unitId },
          data: { status: 'OCCUPIED' },
        })
      } else if (newStatus === 'ENDED' || newStatus === 'TERMINATED') {
        const remainingActive = await tx.lease.findFirst({
          where: {
            unitId: lease.unitId,
            status: 'ACTIVE',
            id: { not: id },
          },
        })
        if (!remainingActive) {
          await tx.unit.update({
            where: { id: lease.unitId },
            data: { status: 'VACANT' },
          })
        }
      }
    }

    return updated
  })
}

export async function deleteLease(user, id) {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: {
      unit: { include: { property: true } },
      _count: { select: { payments: true } },
    },
  })

  if (!lease) {
    throw ApiError.notFound('Lease not found')
  }

  if (user.role !== 'LANDLORD' || lease.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('Only the property owner can delete this lease')
  }

  if (lease._count.payments > 0) {
    throw ApiError.badRequest('Cannot delete lease with recorded payments. Terminate or end the lease instead.')
  }

  await prisma.$transaction(async tx => {
    await tx.lease.delete({ where: { id } })

    if (lease.status === 'ACTIVE') {
      const otherActive = await tx.lease.findFirst({
        where: { unitId: lease.unitId, status: 'ACTIVE' },
      })
      if (!otherActive) {
        await tx.unit.update({
          where: { id: lease.unitId },
          data: { status: 'VACANT' },
        })
      }
    }
  })

  return { message: 'Lease deleted successfully' }
}
