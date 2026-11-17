import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createLeaseSchema,
  leaseIdParamSchema,
  leaseQuerySchema,
  updateLeaseSchema,
} from './leases.validation.js'

test('createLeaseSchema validates valid lease and coerces dates/numbers', () => {
  const input = {
    unitId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    monthlyRent: '25000',
    securityDeposit: '50000',
    dueDay: '5',
  }

  const parsed = createLeaseSchema.parse(input)
  assert.equal(parsed.dueDay, 5)
  assert.equal(parsed.monthlyRent, 25000)
  assert.equal(parsed.securityDeposit, 50000)
  assert.equal(parsed.status, 'ACTIVE')
  assert(parsed.startDate < parsed.endDate)
})

test('createLeaseSchema rejects dueDay outside 1 to 28', () => {
  const base = {
    unitId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    monthlyRent: 25000,
    securityDeposit: 50000,
  }

  assert.throws(() => createLeaseSchema.parse({ ...base, dueDay: 0 }))
  assert.throws(() => createLeaseSchema.parse({ ...base, dueDay: 29 }))
  assert.throws(() => createLeaseSchema.parse({ ...base, dueDay: 31 }))
})

test('createLeaseSchema rejects endDate before startDate', () => {
  assert.throws(() =>
    createLeaseSchema.parse({
      unitId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '123e4567-e89b-12d3-a456-426614174001',
      startDate: '2026-12-31',
      endDate: '2026-01-01',
      monthlyRent: 25000,
      securityDeposit: 50000,
      dueDay: 5,
    })
  )
})

test('updateLeaseSchema validates partial updates and status', () => {
  const parsed = updateLeaseSchema.parse({ status: 'TERMINATED', dueDay: 15 })
  assert.equal(parsed.status, 'TERMINATED')
  assert.equal(parsed.dueDay, 15)
})
