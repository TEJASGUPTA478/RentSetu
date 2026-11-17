import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'

function getPropertyRoleCondition(user) {
  if (user.role === 'LANDLORD') {
    return { ownerId: user.id }
  }
  if (user.role === 'MANAGER') {
    return { managerId: user.id }
  }
  throw ApiError.forbidden('Access denied')
}

export async function listUnits(user, query = {}) {
  const propertyCondition = getPropertyRoleCondition(user)
  const where = {
    property: propertyCondition,
  }

  if (query.propertyId) {
    where.propertyId = query.propertyId
  }

  if (query.status) {
    where.status = query.status
  }

  if (query.search) {
    where.OR = [
      { unitNumber: { contains: query.search, mode: 'insensitive' } },
      { property: { name: { contains: query.search, mode: 'insensitive' } } },
    ]
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, units] = await Promise.all([
    prisma.unit.count({ where }),
    prisma.unit.findMany({
      where,
      skip,
      take,
      orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }],
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            type: true,
          },
        },
        leases: {
          where: { status: 'ACTIVE' },
          take: 1,
          select: {
            id: true,
            startDate: true,
            endDate: true,
            monthlyRent: true,
            dueDay: true,
            status: true,
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

  const formattedUnits = units.map(unit => {
    const activeLease = unit.leases[0] ?? null
    return {
      id: unit.id,
      propertyId: unit.propertyId,
      unitNumber: unit.unitNumber,
      rent: unit.rent,
      bedrooms: unit.bedrooms,
      status: unit.status,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      property: unit.property,
      currentLease: activeLease,
      tenant: activeLease
        ? {
            id: activeLease.tenant.id,
            name: activeLease.tenant.user.name,
            email: activeLease.tenant.user.email,
            phone: activeLease.tenant.phone,
          }
        : null,
    }
  })

  return {
    units: formattedUnits,
    meta: buildMeta(total, page, limit),
  }
}

export async function getUnitById(user, id) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          ownerId: true,
          managerId: true,
          name: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          type: true,
        },
      },
      leases: {
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  })

  if (!unit) {
    throw ApiError.notFound('Unit not found')
  }

  if (user.role === 'LANDLORD' && unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this unit')
  }

  if (user.role === 'MANAGER' && unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this unit')
  }

  if (user.role === 'TENANT') {
    const isTenantOfUnit = unit.leases.some(l => l.tenant.user.id === user.id)
    if (!isTenantOfUnit) {
      throw ApiError.forbidden('You do not have access to this unit')
    }
  }

  const activeLease = unit.leases.find(l => l.status === 'ACTIVE') ?? null

  return {
    id: unit.id,
    propertyId: unit.propertyId,
    unitNumber: unit.unitNumber,
    rent: unit.rent,
    bedrooms: unit.bedrooms,
    status: unit.status,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
    property: unit.property,
    currentLease: activeLease,
    leases: unit.leases,
  }
}

export async function createUnit(user, data) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
  })

  if (!property) {
    throw ApiError.notFound('Property not found')
  }

  if (user.role === 'LANDLORD' && property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to add units to this property')
  }

  if (user.role === 'MANAGER' && property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to add units to this property')
  }

  const existing = await prisma.unit.findUnique({
    where: {
      propertyId_unitNumber: {
        propertyId: data.propertyId,
        unitNumber: data.unitNumber,
      },
    },
  })

  if (existing) {
    throw ApiError.conflict(`Unit '${data.unitNumber}' already exists on this property`)
  }

  return prisma.unit.create({
    data,
    include: {
      property: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  })
}

export async function updateUnit(user, id, data) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
    },
  })

  if (!unit) {
    throw ApiError.notFound('Unit not found')
  }

  if (user.role === 'LANDLORD' && unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this unit')
  }

  if (user.role === 'MANAGER' && unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this unit')
  }

  if (data.unitNumber && data.unitNumber !== unit.unitNumber) {
    const duplicate = await prisma.unit.findUnique({
      where: {
        propertyId_unitNumber: {
          propertyId: unit.propertyId,
          unitNumber: data.unitNumber,
        },
      },
    })
    if (duplicate) {
      throw ApiError.conflict(`Unit '${data.unitNumber}' already exists on this property`)
    }
  }

  return prisma.unit.update({
    where: { id },
    data,
    include: {
      property: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  })
}

export async function deleteUnit(user, id) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      _count: {
        select: {
          leases: true,
          maintenance: true,
        },
      },
    },
  })

  if (!unit) {
    throw ApiError.notFound('Unit not found')
  }

  if (user.role !== 'LANDLORD' || unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('Only the property owner can delete this unit')
  }

  if (unit._count.leases > 0) {
    throw ApiError.badRequest('Cannot delete unit with existing leases. Delete or archive leases first.')
  }

  if (unit._count.maintenance > 0) {
    throw ApiError.badRequest('Cannot delete unit with existing maintenance history.')
  }

  await prisma.unit.delete({
    where: { id },
  })

  return { message: 'Unit deleted successfully' }
}
