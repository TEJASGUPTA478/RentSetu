import assert from 'node:assert/strict'
import test from 'node:test'

process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/rentsetu_test'
process.env.JWT_SECRET ??= 'auth-tests-secret-with-at-least-32-characters'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../../config/prisma.js')
const {
  createMaintenanceRequest,
  deleteMaintenanceRequest,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
} = await import('./maintenance.service.js')

test('createMaintenanceRequest allows tenant to create request for their leased unit', async () => {
  const tenantUser = { id: 'tenant-user-1', role: 'TENANT' }
  prisma.tenantProfile.findUnique = async () => ({ id: 'tenant-prof-1', userId: 'tenant-user-1' })
  prisma.lease.findFirst = async () => ({
    id: 'lease-1',
    unitId: 'unit-1',
    tenantId: 'tenant-prof-1',
  })
  prisma.maintenanceRequest.create = async ({ data }) => ({
    id: 'req-1',
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
    unit: { id: 'unit-1', unitNumber: '101', property: { id: 'prop-1', name: 'Tower A' } },
    tenant: { id: 'tenant-prof-1', phone: '+919999999999', user: { id: 'tenant-user-1', name: 'John' } },
    lease: { id: 'lease-1' },
  })

  const result = await createMaintenanceRequest(tenantUser, {
    title: 'Water leakage',
    description: 'Bathroom sink is leaking',
    unitId: 'unit-1',
  })

  assert.equal(result.id, 'req-1')
  assert.equal(result.status, 'OPEN')
  assert.equal(result.resolvedAt, null)
  assert.equal(result.priority, 'MEDIUM')
})

test('createMaintenanceRequest rejects tenant creating request for a unit they do not lease', async () => {
  const tenantUser = { id: 'tenant-user-1', role: 'TENANT' }
  prisma.tenantProfile.findUnique = async () => ({ id: 'tenant-prof-1', userId: 'tenant-user-1' })
  prisma.lease.findFirst = async () => null // No lease for this unit

  await assert.rejects(
    async () => createMaintenanceRequest(tenantUser, {
      title: 'Water leakage',
      description: 'Bathroom sink is leaking',
      unitId: 'unit-unauthorized',
    }),
    error => error.statusCode === 403 && error.code === 'FORBIDDEN'
  )
})

test('getMaintenanceRequestById enforces role and ownership isolation', async () => {
  prisma.maintenanceRequest.findUnique = async () => ({
    id: 'req-1',
    unitId: 'unit-1',
    tenantId: 'tenant-prof-1',
    title: 'Fan repair',
    description: 'Ceiling fan is making noise',
    priority: 'LOW',
    status: 'OPEN',
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    unit: {
      property: {
        ownerId: 'owner-1',
        managerId: 'manager-1',
      },
    },
    tenant: {
      userId: 'tenant-user-1',
    },
  })

  // Owner 1 can view
  const resOwner = await getMaintenanceRequestById({ id: 'owner-1', role: 'LANDLORD' }, 'req-1')
  assert.equal(resOwner.id, 'req-1')

  // Manager 1 can view
  const resManager = await getMaintenanceRequestById({ id: 'manager-1', role: 'MANAGER' }, 'req-1')
  assert.equal(resManager.id, 'req-1')

  // Tenant user 1 can view
  const resTenant = await getMaintenanceRequestById({ id: 'tenant-user-1', role: 'TENANT' }, 'req-1')
  assert.equal(resTenant.id, 'req-1')

  // Other landlord blocked
  await assert.rejects(
    async () => getMaintenanceRequestById({ id: 'other-owner', role: 'LANDLORD' }, 'req-1'),
    error => error.statusCode === 403
  )

  // Other tenant blocked
  await assert.rejects(
    async () => getMaintenanceRequestById({ id: 'other-tenant', role: 'TENANT' }, 'req-1'),
    error => error.statusCode === 403
  )
})

test('updateMaintenanceRequest manages status changes and resolvedAt timestamp consistently', async () => {
  const landlordUser = { id: 'owner-1', role: 'LANDLORD' }
  const existing = {
    id: 'req-1',
    title: 'AC repair',
    description: 'AC not cooling',
    priority: 'MEDIUM',
    status: 'OPEN',
    resolvedAt: null,
    unit: { property: { ownerId: 'owner-1' } },
  }
  prisma.maintenanceRequest.findUnique = async () => ({ ...existing })

  let updatePayload
  prisma.maintenanceRequest.update = async ({ data }) => {
    updatePayload = data
    return {
      ...existing,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      unit: { unitNumber: '101', property: { name: 'P' } },
      tenant: { phone: '123', user: { name: 'T' } },
    }
  }

  // 1. Resolve: should set resolvedAt
  const resolved = await updateMaintenanceRequest(landlordUser, 'req-1', { status: 'RESOLVED' })
  assert.equal(resolved.status, 'RESOLVED')
  assert(updatePayload.resolvedAt instanceof Date)

  // 2. Reopen to IN_PROGRESS: should clear resolvedAt to null
  existing.status = 'RESOLVED'
  existing.resolvedAt = new Date()
  const reopened = await updateMaintenanceRequest(landlordUser, 'req-1', { status: 'IN_PROGRESS' })
  assert.equal(reopened.status, 'IN_PROGRESS')
  assert.equal(updatePayload.resolvedAt, null)

  // 3. Close from resolved: preserves resolvedAt
  existing.status = 'RESOLVED'
  const pastResolvedDate = new Date('2026-11-10T10:00:00Z')
  existing.resolvedAt = pastResolvedDate
  await updateMaintenanceRequest(landlordUser, 'req-1', { status: 'CLOSED' })
  assert.equal(updatePayload.resolvedAt.getTime(), pastResolvedDate.getTime())

  // 4. Update priority only: resolvedAt is not modified
  existing.status = 'OPEN'
  existing.resolvedAt = null
  updatePayload = undefined
  await updateMaintenanceRequest(landlordUser, 'req-1', { priority: 'URGENT' })
  assert.equal(updatePayload.priority, 'URGENT')
  assert.equal(updatePayload.resolvedAt, undefined)
})

test('updateMaintenanceRequest rejects tenant callers with 403 Forbidden', async () => {
  const tenantUser = { id: 'tenant-user-1', role: 'TENANT' }
  await assert.rejects(
    async () => updateMaintenanceRequest(tenantUser, 'req-1', { status: 'RESOLVED' }),
    error => error.statusCode === 403 && error.code === 'FORBIDDEN'
  )
})

test('deleteMaintenanceRequest preserves maintenance history by rejecting deletion with 400', async () => {
  await assert.rejects(
    async () => deleteMaintenanceRequest({ id: 'owner-1', role: 'LANDLORD' }, 'req-1'),
    error => error.statusCode === 400 && error.message.includes('preserve maintenance history')
  )
})
