import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPropertySchema,
  propertyIdParamSchema,
  propertyQuerySchema,
  updatePropertySchema,
} from './properties.validation.js'

test('createPropertySchema parses valid property data', () => {
  const input = {
    name: '  Green Heights  ',
    address: '100 Main St',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    type: 'Apartment',
    managerId: null,
  }

  const result = createPropertySchema.parse(input)
  assert.equal(result.name, 'Green Heights')
  assert.equal(result.city, 'Bengaluru')
  assert.equal(result.managerId, null)
})

test('createPropertySchema rejects missing required fields', () => {
  assert.throws(() => createPropertySchema.parse({ name: 'Heights' }))
  assert.throws(() => createPropertySchema.parse({}))
})

test('updatePropertySchema allows partial updates', () => {
  const result = updatePropertySchema.parse({ name: 'New Name' })
  assert.equal(result.name, 'New Name')
  assert.equal(result.city, undefined)
})

test('propertyIdParamSchema validates uuid format', () => {
  const valid = '123e4567-e89b-12d3-a456-426614174000'
  assert.equal(propertyIdParamSchema.parse({ id: valid }).id, valid)
  assert.throws(() => propertyIdParamSchema.parse({ id: 'invalid-id' }))
})

test('propertyQuerySchema handles optional search filters', () => {
  const parsed = propertyQuerySchema.parse({ search: 'Heights', city: 'Bengaluru', page: '2' })
  assert.equal(parsed.search, 'Heights')
  assert.equal(parsed.city, 'Bengaluru')
  assert.equal(parsed.page, '2')
})
