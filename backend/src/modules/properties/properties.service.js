import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'

function getRolePropertyFilter(user) {
  if (user.role === 'LANDLORD') {
    return { ownerId: user.id }
  }
  if (user.role === 'MANAGER') {
    return { managerId: user.id }
  }
  throw ApiError.forbidden('Access denied')
}

export async function listProperties(user, query = {}) {
  const roleFilter = getRolePropertyFilter(user)
  const where = { ...roleFilter }

  if (query.city) {
    where.city = { equals: query.city, mode: 'insensitive' }
  }

  if (query.type) {
    where.type = { equals: query.type, mode: 'insensitive' }
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { address: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        units: {
          select: {
            id: true,
            status: true,
            rent: true,
          },
        },
      },
    }),
  ])

  const formattedProperties = properties.map(property => {
    const totalUnits = property.units.length
    const occupiedUnits = property.units.filter(u => u.status === 'OCCUPIED').length
    const totalRent = property.units.reduce((sum, u) => sum + Number(u.rent), 0)
    const { units, ...rest } = property

    return {
      ...rest,
      totalUnits,
      occupiedUnits,
      totalRent,
    }
  })

  return {
    properties: formattedProperties,
    meta: buildMeta(total, page, limit),
  }
}

export async function getPropertyById(user, id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
      units: {
        select: {
          id: true,
          unitNumber: true,
          rent: true,
          bedrooms: true,
          status: true,
          createdAt: true,
        },
        orderBy: { unitNumber: 'asc' },
      },
    },
  })

  if (!property) {
    throw ApiError.notFound('Property not found')
  }

  if (user.role === 'LANDLORD' && property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this property')
  }

  if (user.role === 'MANAGER' && property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this property')
  }

  if (user.role === 'TENANT') {
    const tenantLease = await prisma.lease.findFirst({
      where: {
        tenant: { userId: user.id },
        unit: { propertyId: id },
      },
    })
    if (!tenantLease) {
      throw ApiError.forbidden('You do not have access to this property')
    }
  }

  const totalUnits = property.units.length
  const occupiedUnits = property.units.filter(u => u.status === 'OCCUPIED').length
  const totalRent = property.units.reduce((sum, u) => sum + Number(u.rent), 0)

  return {
    ...property,
    totalUnits,
    occupiedUnits,
    totalRent,
  }
}

export async function createProperty(user, data) {
  if (user.role !== 'LANDLORD') {
    throw ApiError.forbidden('Only landlords can create properties')
  }

  if (data.managerId) {
    const manager = await prisma.user.findUnique({
      where: { id: data.managerId },
    })
    if (!manager || (manager.role !== 'MANAGER' && manager.role !== 'LANDLORD')) {
      throw ApiError.badRequest('Invalid manager ID provided')
    }
  }

  return prisma.property.create({
    data: {
      ...data,
      ownerId: user.id,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function updateProperty(user, id, data) {
  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property) {
    throw ApiError.notFound('Property not found')
  }

  if (user.role === 'LANDLORD' && property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have access to update this property')
  }

  if (user.role === 'MANAGER') {
    if (property.managerId !== user.id) {
      throw ApiError.forbidden('You do not have access to update this property')
    }
    if (data.managerId !== undefined) {
      throw ApiError.forbidden('Managers cannot reassign property manager')
    }
  }

  if (data.managerId) {
    const manager = await prisma.user.findUnique({
      where: { id: data.managerId },
    })
    if (!manager || (manager.role !== 'MANAGER' && manager.role !== 'LANDLORD')) {
      throw ApiError.badRequest('Invalid manager ID provided')
    }
  }

  return prisma.property.update({
    where: { id },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      manager: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function deleteProperty(user, id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      _count: { select: { units: true } },
    },
  })

  if (!property) {
    throw ApiError.notFound('Property not found')
  }

  if (user.role !== 'LANDLORD' || property.ownerId !== user.id) {
    throw ApiError.forbidden('Only the property owner can delete this property')
  }

  if (property._count.units > 0) {
    throw ApiError.badRequest('Cannot delete property that has units. Delete all units first.')
  }

  await prisma.property.delete({
    where: { id },
  })

  return { message: 'Property deleted successfully' }
}
