import bcrypt from 'bcrypt'
import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import { buildMeta, parsePagination } from '../../utils/pagination.js'

export async function listTenants(user, query = {}) {
  let where = {}

  if (user.role === 'LANDLORD') {
    where = {
      OR: [
        { createdByLandlordId: user.id },
        { leases: { some: { unit: { property: { ownerId: user.id } } } } },
      ],
    }
  } else if (user.role === 'MANAGER') {
    where = {
      leases: { some: { unit: { property: { managerId: user.id } } } },
    }
  } else {
    throw ApiError.forbidden('Access denied')
  }

  if (query.search) {
    const searchFilter = [
      { phone: { contains: query.search, mode: 'insensitive' } },
      { user: { name: { contains: query.search, mode: 'insensitive' } } },
      { user: { email: { contains: query.search, mode: 'insensitive' } } },
    ]

    if (where.OR) {
      where = {
        AND: [
          { OR: where.OR },
          { OR: searchFilter },
        ],
      }
    } else {
      where.OR = searchFilter
    }
  }

  const { page, limit, skip, take } = parsePagination(query)

  const [total, tenants] = await Promise.all([
    prisma.tenantProfile.count({ where }),
    prisma.tenantProfile.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
        leases: {
          orderBy: { createdAt: 'desc' },
          include: {
            unit: {
              select: {
                id: true,
                unitNumber: true,
                rent: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  const formattedTenants = tenants.map(t => {
    const activeLease = t.leases.find(l => l.status === 'ACTIVE') ?? t.leases[0] ?? null
    return {
      id: t.id,
      userId: t.userId,
      createdByLandlordId: t.createdByLandlordId,
      name: t.user.name,
      email: t.user.email,
      phone: t.phone,
      emergencyContactName: t.emergencyContactName,
      emergencyContactPhone: t.emergencyContactPhone,
      idProofType: t.idProofType,
      idProofNumber: t.idProofNumber,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      property: activeLease?.unit?.property?.name ?? null,
      propertyId: activeLease?.unit?.property?.id ?? null,
      unit: activeLease?.unit?.unitNumber ?? null,
      unitId: activeLease?.unit?.id ?? null,
      lease: activeLease
        ? {
            id: activeLease.id,
            status: activeLease.status,
            startDate: activeLease.startDate,
            endDate: activeLease.endDate,
            monthlyRent: activeLease.monthlyRent,
          }
        : null,
      leasesCount: t.leases.length,
    }
  })

  return {
    tenants: formattedTenants,
    meta: buildMeta(total, page, limit),
  }
}

export async function getTenantById(user, id) {
  const tenant = await prisma.tenantProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },
      leases: {
        orderBy: { createdAt: 'desc' },
        include: {
          unit: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  ownerId: true,
                  managerId: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!tenant) {
    throw ApiError.notFound('Tenant not found')
  }

  if (user.role === 'TENANT') {
    if (tenant.userId !== user.id) {
      throw ApiError.forbidden('You do not have permission to view this tenant profile')
    }
  } else if (user.role === 'LANDLORD') {
    const isCreator = tenant.createdByLandlordId === user.id
    const hasLeasedProperty = tenant.leases.some(l => l.unit.property.ownerId === user.id)
    if (!isCreator && !hasLeasedProperty) {
      throw ApiError.forbidden('You do not have permission to view this tenant profile')
    }
  } else if (user.role === 'MANAGER') {
    const hasManagedProperty = tenant.leases.some(l => l.unit.property.managerId === user.id)
    if (!hasManagedProperty) {
      throw ApiError.forbidden('You do not have permission to view this tenant profile')
    }
  }

  const activeLease = tenant.leases.find(l => l.status === 'ACTIVE') ?? null

  return {
    id: tenant.id,
    userId: tenant.userId,
    createdByLandlordId: tenant.createdByLandlordId,
    name: tenant.user.name,
    email: tenant.user.email,
    phone: tenant.phone,
    emergencyContactName: tenant.emergencyContactName,
    emergencyContactPhone: tenant.emergencyContactPhone,
    idProofType: tenant.idProofType,
    idProofNumber: tenant.idProofNumber,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    activeLease,
    leases: tenant.leases,
  }
}

export async function getMyTenantProfile(user) {
  const tenant = await prisma.tenantProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
      },
      leases: {
        orderBy: { createdAt: 'desc' },
        include: {
          unit: {
            include: {
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
        },
      },
    },
  })

  if (!tenant) {
    throw ApiError.notFound('Tenant profile not found for this user account')
  }

  const activeLease = tenant.leases.find(l => l.status === 'ACTIVE') ?? null

  return {
    id: tenant.id,
    userId: tenant.userId,
    name: tenant.user.name,
    email: tenant.user.email,
    phone: tenant.phone,
    emergencyContactName: tenant.emergencyContactName,
    emergencyContactPhone: tenant.emergencyContactPhone,
    idProofType: tenant.idProofType,
    idProofNumber: tenant.idProofNumber,
    activeLease,
    leases: tenant.leases,
  }
}

export async function createTenant(user, data) {
  if (user.role !== 'LANDLORD') {
    throw ApiError.forbidden('Only landlords can create tenant profiles')
  }

  const normalizedEmail = data.email.trim().toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { tenantProfile: true },
  })

  if (existingUser) {
    if (existingUser.tenantProfile) {
      throw ApiError.conflict('A tenant profile with this email already exists')
    }
    if (existingUser.role !== 'TENANT') {
      throw ApiError.badRequest(`An account with this email already exists with role '${existingUser.role}'`)
    }

    return prisma.tenantProfile.create({
      data: {
        userId: existingUser.id,
        createdByLandlordId: user.id,
        phone: data.phone,
        emergencyContactName: data.emergencyContactName ?? null,
        emergencyContactPhone: data.emergencyContactPhone ?? null,
        idProofType: data.idProofType ?? null,
        idProofNumber: data.idProofNumber ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  const rawPassword = data.password || 'Password@123'
  const passwordHash = await bcrypt.hash(rawPassword, 12)

  return prisma.$transaction(async tx => {
    const newUser = await tx.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'TENANT',
        isActive: true,
      },
    })

    const profile = await tx.tenantProfile.create({
      data: {
        userId: newUser.id,
        createdByLandlordId: user.id,
        phone: data.phone,
        emergencyContactName: data.emergencyContactName ?? null,
        emergencyContactPhone: data.emergencyContactPhone ?? null,
        idProofType: data.idProofType ?? null,
        idProofNumber: data.idProofNumber ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return profile
  })
}

export async function updateTenant(user, id, data) {
  const tenant = await prisma.tenantProfile.findUnique({
    where: { id },
    include: {
      leases: {
        include: {
          unit: {
            include: { property: true },
          },
        },
      },
    },
  })

  if (!tenant) {
    throw ApiError.notFound('Tenant not found')
  }

  if (user.role === 'TENANT') {
    if (tenant.userId !== user.id) {
      throw ApiError.forbidden('You can only update your own profile')
    }
  } else if (user.role === 'LANDLORD') {
    const isCreator = tenant.createdByLandlordId === user.id
    const hasLeasedProperty = tenant.leases.some(l => l.unit.property.ownerId === user.id)
    if (!isCreator && !hasLeasedProperty) {
      throw ApiError.forbidden('You do not have permission to update this tenant')
    }
  } else if (user.role === 'MANAGER') {
    const hasManagedProperty = tenant.leases.some(l => l.unit.property.managerId === user.id)
    if (!hasManagedProperty) {
      throw ApiError.forbidden('You do not have permission to update this tenant')
    }
  }

  const { name, ...profileFields } = data

  return prisma.$transaction(async tx => {
    if (name) {
      await tx.user.update({
        where: { id: tenant.userId },
        data: { name: name.trim() },
      })
    }

    const updatedProfile = await tx.tenantProfile.update({
      where: { id },
      data: profileFields,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return updatedProfile
  })
}

export async function deleteTenant(user, id) {
  const tenant = await prisma.tenantProfile.findUnique({
    where: { id },
    include: {
      leases: true,
      maintenanceRequests: true,
    },
  })

  if (!tenant) {
    throw ApiError.notFound('Tenant not found')
  }

  if (user.role !== 'LANDLORD' || tenant.createdByLandlordId !== user.id) {
    throw ApiError.forbidden('Only the landlord who created this tenant can delete them')
  }

  const hasActiveLease = tenant.leases.some(l => l.status === 'ACTIVE')
  if (hasActiveLease) {
    throw ApiError.badRequest('Cannot delete tenant with active leases. Terminate active leases first.')
  }

  if (tenant.leases.length > 0 || tenant.maintenanceRequests.length > 0) {
    throw ApiError.badRequest('Cannot delete tenant with existing lease or maintenance history.')
  }

  await prisma.$transaction(async tx => {
    await tx.tenantProfile.delete({ where: { id } })
    await tx.user.delete({ where: { id: tenant.userId } })
  })

  return { message: 'Tenant profile deleted successfully' }
}
