import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createMaintenanceSchema,
  maintenanceIdParamSchema,
  maintenancePriorityEnum,
  maintenanceQuerySchema,
  maintenanceStatusEnum,
  updateMaintenanceStatusSchema,
} from './maintenance.validation.js'

test('createMaintenanceSchema validates valid maintenance request and applies defaults', () => {
  const input = {
    title: 'Plumbing leak in bathroom',
    description: 'The pipe under the sink has a slow leak and is pooling water.',
    unitId: '123e4567-e89b-12d3-a456-426614174000',
  }

  const parsed = createMaintenanceSchema.parse(input)
  assert.equal(parsed.title, 'Plumbing leak in bathroom')
  assert.equal(parsed.priority, 'MEDIUM')
  assert.equal(parsed.unitId, '123e4567-e89b-12d3-a456-426614174000')
})

test('createMaintenanceSchema rejects short title/description and invalid priority', () => {
  const base = {
    title: 'Good title',
    description: 'Good description of issue',
  }

  assert.throws(() => createMaintenanceSchema.parse({ ...base, title: 'No' }))
  assert.throws(() => createMaintenanceSchema.parse({ ...base, description: 'bad' }))
  assert.throws(() => createMaintenanceSchema.parse({ ...base, priority: 'SUPER_URGENT' }))
  assert.throws(() => createMaintenanceSchema.parse({ ...base, unitId: 'invalid-uuid' }))
})

test('updateMaintenanceStatusSchema validates status transitions and priority updates', () => {
  assert.throws(() => updateMaintenanceStatusSchema.parse({}))

  const parsed = updateMaintenanceStatusSchema.parse({
    status: 'RESOLVED',
    priority: 'HIGH',
  })
  assert.equal(parsed.status, 'RESOLVED')
  assert.equal(parsed.priority, 'HIGH')

  assert.throws(() => updateMaintenanceStatusSchema.parse({ status: 'INVALID_STATUS' }))
})

test('maintenanceQuerySchema validates optional filter queries', () => {
  const parsed = maintenanceQuerySchema.parse({
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    page: '1',
    limit: '10',
  })
  assert.equal(parsed.status, 'IN_PROGRESS')
  assert.equal(parsed.priority, 'URGENT')
  assert.equal(parsed.page, '1')
  assert.equal(parsed.limit, '10')
})

test('maintenanceIdParamSchema rejects non-uuid identifiers', () => {
  assert.equal(
    maintenanceIdParamSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000' }).id,
    '123e4567-e89b-12d3-a456-426614174000'
  )
  assert.throws(() => maintenanceIdParamSchema.parse({ id: 'invalid-id' }))
})
