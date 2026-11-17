import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createUnitSchema,
  unitIdParamSchema,
  unitQuerySchema,
  updateUnitSchema,
} from './units.validation.js'

test('createUnitSchema validates correct unit fields and coerces numbers', () => {
  const input = {
    propertyId: '123e4567-e89b-12d3-a456-426614174000',
    unitNumber: 'A-101',
    rent: '25000',
    bedrooms: '2',
  }

  const parsed = createUnitSchema.parse(input)
  assert.equal(parsed.unitNumber, 'A-101')
  assert.equal(parsed.rent, 25000)
  assert.equal(parsed.bedrooms, 2)
  assert.equal(parsed.status, 'VACANT')
})

test('createUnitSchema rejects negative rent or bedrooms', () => {
  assert.throws(() =>
    createUnitSchema.parse({
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      unitNumber: 'A-101',
      rent: -100,
      bedrooms: 1,
    })
  )

  assert.throws(() =>
    createUnitSchema.parse({
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      unitNumber: 'A-101',
      rent: 1000,
      bedrooms: -1,
    })
  )
})

test('updateUnitSchema permits updating status and rent', () => {
  const parsed = updateUnitSchema.parse({ status: 'OCCUPIED', rent: 30000 })
  assert.equal(parsed.status, 'OCCUPIED')
  assert.equal(parsed.rent, 30000)
})

test('unitIdParamSchema rejects non-uuid', () => {
  assert.throws(() => unitIdParamSchema.parse({ id: 'bad' }))
})
