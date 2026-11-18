import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPaymentSchema,
  paymentIdParamSchema,
  paymentQuerySchema,
  updatePaymentSchema,
} from './payments.validation.js'

test('createPaymentSchema validates valid payment and coerces numbers/dates', () => {
  const input = {
    leaseId: '123e4567-e89b-12d3-a456-426614174000',
    billingMonth: '2026-11-01',
    amount: '25000',
    method: 'UPI',
    paidOn: '2026-11-05',
    notes: '  Rent for November  ',
  }

  const parsed = createPaymentSchema.parse(input)
  assert.equal(parsed.leaseId, '123e4567-e89b-12d3-a456-426614174000')
  assert.equal(parsed.amount, 25000)
  assert.equal(parsed.method, 'UPI')
  assert.equal(parsed.notes, 'Rent for November')
  assert(parsed.billingMonth instanceof Date)
  assert(parsed.paidOn instanceof Date)
})

test('createPaymentSchema rejects invalid UUID, zero/negative amount, and unknown method', () => {
  const base = {
    leaseId: '123e4567-e89b-12d3-a456-426614174000',
    billingMonth: '2026-11-01',
    amount: 10000,
    method: 'CASH',
  }

  assert.throws(() => createPaymentSchema.parse({ ...base, leaseId: 'not-a-uuid' }))
  assert.throws(() => createPaymentSchema.parse({ ...base, amount: 0 }))
  assert.throws(() => createPaymentSchema.parse({ ...base, amount: -500 }))
  assert.throws(() => createPaymentSchema.parse({ ...base, method: 'BITCOIN' }))
})

test('updatePaymentSchema allows partial updates and rejects empty payload', () => {
  assert.throws(() => updatePaymentSchema.parse({}))

  const parsed = updatePaymentSchema.parse({
    amount: '30000',
    method: 'BANK_TRANSFER',
    notes: 'Updated notes',
  })
  assert.equal(parsed.amount, 30000)
  assert.equal(parsed.method, 'BANK_TRANSFER')
  assert.equal(parsed.notes, 'Updated notes')
})

test('paymentQuerySchema validates optional filters and pagination', () => {
  const parsed = paymentQuerySchema.parse({
    method: 'CHEQUE',
    page: '2',
    limit: '20',
  })
  assert.equal(parsed.method, 'CHEQUE')
  assert.equal(parsed.page, '2')
  assert.equal(parsed.limit, '20')
})

test('paymentIdParamSchema validates uuid format', () => {
  assert.equal(
    paymentIdParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' }).id,
    '123e4567-e89b-12d3-a456-426614174000'
  )
  assert.throws(() => paymentIdParamSchema.parse({ id: 'bad-id' }))
})
