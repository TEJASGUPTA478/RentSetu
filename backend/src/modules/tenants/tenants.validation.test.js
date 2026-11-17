import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createTenantSchema,
  tenantIdParamSchema,
  tenantQuerySchema,
  updateTenantSchema,
} from './tenants.validation.js'

test('createTenantSchema normalizes email and trims strings', () => {
  const input = {
    name: '  Rahul Verma ',
    email: '  RAHUL@EXAMPLE.COM ',
    phone: '+91 99999 88888',
    emergencyContactName: 'Asha Verma',
  }

  const parsed = createTenantSchema.parse(input)
  assert.equal(parsed.name, 'Rahul Verma')
  assert.equal(parsed.email, 'rahul@example.com')
  assert.equal(parsed.phone, '+91 99999 88888')
  assert.equal(parsed.emergencyContactName, 'Asha Verma')
})

test('createTenantSchema rejects invalid email', () => {
  assert.throws(() =>
    createTenantSchema.parse({
      name: 'Test',
      email: 'not-an-email',
      phone: '1234567890',
    })
  )
})

test('updateTenantSchema allows partial updates including nullables', () => {
  const parsed = updateTenantSchema.parse({
    emergencyContactName: null,
    phone: '+91 12345 67890',
  })
  assert.equal(parsed.emergencyContactName, null)
  assert.equal(parsed.phone, '+91 12345 67890')
})

test('tenantIdParamSchema validates uuid', () => {
  const valid = '123e4567-e89b-12d3-a456-426614174000'
  assert.equal(tenantIdParamSchema.parse({ id: valid }).id, valid)
  assert.throws(() => tenantIdParamSchema.parse({ id: '123' }))
})
