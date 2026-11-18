import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'

function getRoleMaintenanceFilter(user) {
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

export function formatMaintenanceRequest(request) {
  const formatted = {
    id: request.id,
    unitId: request.unitId,
    leaseId: request.leaseId,
    tenantId: request.tenantId,
    title: request.title,
    description: request.description,
    priority: request.priority,
    status: request.status,
    resolvedAt: request.resolvedAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    issue: request.title,
    date: request.createdAt ? request.createdAt.toISOString().slice(0, 10) : null,
  }

  if (request.unit) {
    formatted.unit = {
      id: request.unit.id,
      unitNumber: request.unit.unitNumber,
      property: request.unit.property ? {
        id: request.unit.property.id,
        name: request.unit.property.name,
        address: request.unit.property.address,
        city: request.unit.property.city,
      } : undefined,
    }
    formatted.unitNumber = request.unit.unitNumber
    if (request.unit.property) {
      formatted.property = request.unit.property.name
      formatted.propertyId = request.unit.property.id
    }
  }

  if (request.tenant) {
    formatted.tenant = {
      id: request.tenant.id,
      phone: request.tenant.phone,
      user: request.tenant.user ? {
        id: request.tenant.user.id,
        name: request.tenant.user.name,
        email: request.tenant.user.email,
      } : undefined,
    }
    if (request.tenant.user?.name) {
      formatted.tenantName = request.tenant.user.name
      formatted.tenantEmail = request.tenant.user.email
    }
  }

  if (request.lease) {
    formatted.lease = {
      id: request.lease.id,
      startDate: request.lease.startDate,
      endDate: request.lease.endDate,
      status: request.lease.status,
    }
  }

  return formatted
}

export async function listMaintenanceRequests(user, query = {}) {
  const roleFilter = getRoleMaintenanceFilter(user)
  const where = { ...roleFilter }

  if (query.status) {
    where.status = query.status
  }

  if (query.priority) {
    where.priority = query.priority
  }

  if (query.unitId) {
    where.unitId = query.unitId
  }

  if (query.propertyId) {
    where.unit = {
      ...(where.unit || {}),
      propertyId: query.propertyId,
    }
  }

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  if (query.leaseId) {
    where.leaseId = query.leaseId
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, requests] = await Promise.all([
    prisma.maintenanceRequest.count({ where }),
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
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
        lease: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    }),
  ])

  return {
    requests: requests.map(formatMaintenanceRequest),
    meta: buildMeta(total, page, limit),
  }
}

export async function getMaintenanceRequestById(user, id) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
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
      lease: true,
    },
  })

  if (!request) {
    throw ApiError.notFound('Maintenance request not found')
  }

  if (user.role === 'LANDLORD' && request.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this maintenance request')
  }

  if (user.role === 'MANAGER' && request.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have access to this maintenance request')
  }

  if (user.role === 'TENANT' && request.tenant.userId !== user.id) {
    throw ApiError.forbidden('You do not have access to this maintenance request')
  }

  return formatMaintenanceRequest(request)
}

export async function createMaintenanceRequest(user, data) {
  let unitId = data.unitId
  let leaseId = data.leaseId || null
  let tenantId = data.tenantId

  if (user.role === 'TENANT') {
    const profile = await prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      throw ApiError.forbidden('Tenant profile not found')
    }

    tenantId = profile.id

    if (unitId) {
      const lease = await prisma.lease.findFirst({
        where: { tenantId: profile.id, unitId },
      })
      if (!lease) {
        throw ApiError.forbidden('You do not have a lease for this unit')
      }
      leaseId = leaseId || lease.id
    } else {
      const activeLease = await prisma.lease.findFirst({
        where: { tenantId: profile.id, status: 'ACTIVE' },
        orderBy: { startDate: 'desc' },
      })
      if (!activeLease) {
        throw ApiError.badRequest('unitId is required when no active lease is found')
      }
      unitId = activeLease.unitId
      leaseId = activeLease.id
    }
  } else if (user.role === 'LANDLORD' || user.role === 'MANAGER') {
    if (!unitId) {
      throw ApiError.badRequest('unitId is required')
    }

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { property: true },
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

    if (tenantId) {
      const tenant = await prisma.tenantProfile.findUnique({
        where: { id: tenantId },
      })
      if (!tenant) {
        throw ApiError.notFound('Tenant profile not found')
      }
    } else {
      const activeLease = await prisma.lease.findFirst({
        where: { unitId, status: 'ACTIVE' },
      })
      if (activeLease) {
        tenantId = activeLease.tenantId
        leaseId = leaseId || activeLease.id
      } else {
        throw ApiError.badRequest('tenantId is required for this maintenance request')
      }
    }
  } else {
    throw ApiError.forbidden('Access denied')
  }

  const created = await prisma.maintenanceRequest.create({
    data: {
      unitId,
      leaseId,
      tenantId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      resolvedAt: null,
    },
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
      lease: true,
    },
  })

  return formatMaintenanceRequest(created)
}

export async function updateMaintenanceRequest(user, id, data) {
  if (user.role !== 'LANDLORD' && user.role !== 'MANAGER') {
    throw ApiError.forbidden('Only landlords and managers can update maintenance requests')
  }

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          property: true,
        },
      },
    },
  })

  if (!request) {
    throw ApiError.notFound('Maintenance request not found')
  }

  if (user.role === 'LANDLORD' && request.unit.property.ownerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this maintenance request')
  }

  if (user.role === 'MANAGER' && request.unit.property.managerId !== user.id) {
    throw ApiError.forbidden('You do not have permission to update this maintenance request')
  }

  const updateData = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.priority !== undefined) updateData.priority = data.priority

  if (data.status !== undefined) {
    updateData.status = data.status
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      updateData.resolvedAt = request.resolvedAt ? request.resolvedAt : new Date()
    } else if (data.status === 'OPEN' || data.status === 'IN_PROGRESS') {
      updateData.resolvedAt = null
    }
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
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
      lease: true,
    },
  })

  return formatMaintenanceRequest(updated)
}

export async function deleteMaintenanceRequest() {
  throw ApiError.badRequest('Maintenance requests cannot be deleted to preserve maintenance history')
}
