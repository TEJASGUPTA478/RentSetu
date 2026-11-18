import assert from 'node:assert/strict'
import test from 'node:test'

process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/rentsetu_test'
process.env.JWT_SECRET ??= 'auth-tests-secret-with-at-least-32-characters'
process.env.NODE_ENV = 'test'

const { prisma } = await import('../../config/prisma.js')
const {
  getPaymentById,
  listPayments,
  recordPayment,
  updatePayment,
} = await import('./payments.service.js')

test('recordPayment rejects tenant callers with 403 Forbidden', async () => {
  const tenantUser = { id: 'tenant-user-1', role: 'TENANT' }
  await assert.rejects(
    async () => recordPayment(tenantUser, { leaseId: 'lease-1', billingMonth: '2026-11-01', amount: 15000, method: 'UPI' }),
    error => error.statusCode === 403 && error.code === 'FORBIDDEN'
  )
})

test('recordPayment rejects nonexistent lease with 404 Not Found', async () => {
  const landlordUser = { id: 'landlord-1', role: 'LANDLORD' }
  prisma.lease.findUnique = async () => null

  await assert.rejects(
    async () => recordPayment(landlordUser, { leaseId: 'nonexistent-lease', billingMonth: '2026-11-01', amount: 15000, method: 'UPI' }),
    error => error.statusCode === 404 && error.code === 'NOT_FOUND'
  )
})

test('recordPayment enforces ownership isolation (cannot record payment for another landlord)', async () => {
  const landlordUser = { id: 'landlord-1', role: 'LANDLORD' }
  prisma.lease.findUnique = async () => ({
    id: 'lease-1',
    unit: {
      property: {
        ownerId: 'different-landlord-id',
        managerId: null,
      },
    },
    tenant: { user: { id: 'tenant-1' } },
  })

  await assert.rejects(
    async () => recordPayment(landlordUser, { leaseId: 'lease-1', billingMonth: '2026-11-01', amount: 15000, method: 'UPI' }),
    error => error.statusCode === 403 && error.code === 'FORBIDDEN'
  )
})

test('recordPayment enforces one payment per lease per month with 409 Conflict', async () => {
  const landlordUser = { id: 'landlord-1', role: 'LANDLORD' }
  prisma.lease.findUnique = async () => ({
    id: 'lease-1',
    unit: {
      property: {
        ownerId: 'landlord-1',
        managerId: null,
      },
    },
    tenant: { user: { id: 'tenant-1' } },
  })
  prisma.payment.findUnique = async () => ({
    id: 'existing-payment-id',
    leaseId: 'lease-1',
    billingMonth: new Date('2026-11-01T00:00:00.000Z'),
  })

  await assert.rejects(
    async () => recordPayment(landlordUser, { leaseId: 'lease-1', billingMonth: '2026-11-15', amount: 15000, method: 'UPI' }),
    error => error.statusCode === 409 && error.code === 'CONFLICT' && error.message.includes('already been recorded')
  )
})

test('recordPayment successfully creates payment and normalizes billing month to 1st of month', async () => {
  const landlordUser = { id: 'landlord-1', role: 'LANDLORD' }
  prisma.lease.findUnique = async () => ({
    id: 'lease-1',
    dueDay: 5,
    monthlyRent: 20000,
    unit: {
      id: 'unit-1',
      unitNumber: 'A-101',
      property: {
        id: 'prop-1',
        name: 'Grand Heights',
        ownerId: 'landlord-1',
        managerId: null,
      },
    },
    tenant: {
      id: 'tenant-prof-1',
      user: { id: 'tenant-user-1', name: 'John Doe', email: 'john@example.com' },
    },
  })
  prisma.payment.findUnique = async () => null

  let createdData
  prisma.payment.create = async ({ data }) => {
    createdData = data
    return {
      id: 'payment-1',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      lease: {
        id: 'lease-1',
        dueDay: 5,
        monthlyRent: 20000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'ACTIVE',
        unit: {
          id: 'unit-1',
          unitNumber: 'A-101',
          property: { id: 'prop-1', name: 'Grand Heights' },
        },
        tenant: {
          id: 'tenant-prof-1',
          phone: '+919999999999',
          user: { id: 'tenant-user-1', name: 'John Doe', email: 'john@example.com' },
        },
      },
    }
  }

  const result = await recordPayment(landlordUser, {
    leaseId: 'lease-1',
    billingMonth: '2026-11-20',
    amount: 20000,
    method: 'UPI',
    paidOn: '2026-11-04',
  })

  assert.equal(createdData.billingMonth.getUTCDate(), 1)
  assert.equal(result.id, 'payment-1')
  assert.equal(result.status, 'Paid')
  assert.equal(result.due, '2026-11-05')
  assert.equal(result.paid, '2026-11-04')
  assert.equal(result.amount, 20000)
})

test('getPaymentById isolates ownership across landlord, manager, and tenant', async () => {
  prisma.payment.findUnique = async () => ({
    id: 'pay-1',
    leaseId: 'lease-1',
    billingMonth: new Date('2026-11-01'),
    amount: 15000,
    method: 'UPI',
    paidOn: new Date('2026-11-03'),
    createdAt: new Date(),
    updatedAt: new Date(),
    lease: {
      id: 'lease-1',
      dueDay: 5,
      monthlyRent: 15000,
      unit: {
        property: {
          ownerId: 'owner-1',
          managerId: 'manager-1',
        },
      },
      tenant: {
        userId: 'tenant-user-1',
      },
    },
  })

  // Owner 1 can view
  const resOwner = await getPaymentById({ id: 'owner-1', role: 'LANDLORD' }, 'pay-1')
  assert.equal(resOwner.id, 'pay-1')

  // Manager 1 can view
  const resManager = await getPaymentById({ id: 'manager-1', role: 'MANAGER' }, 'pay-1')
  assert.equal(resManager.id, 'pay-1')

  // Tenant user 1 can view
  const resTenant = await getPaymentById({ id: 'tenant-user-1', role: 'TENANT' }, 'pay-1')
  assert.equal(resTenant.id, 'pay-1')

  // Other landlord blocked
  await assert.rejects(
    async () => getPaymentById({ id: 'other-owner', role: 'LANDLORD' }, 'pay-1'),
    error => error.statusCode === 403
  )

  // Other tenant blocked
  await assert.rejects(
    async () => getPaymentById({ id: 'other-tenant', role: 'TENANT' }, 'pay-1'),
    error => error.statusCode === 403
  )
})

test('getPaymentById rejects nonexistent payment with 404', async () => {
  prisma.payment.findUnique = async () => null
  await assert.rejects(
    async () => getPaymentById({ id: 'owner-1', role: 'LANDLORD' }, 'nonexistent'),
    error => error.statusCode === 404
  )
})
