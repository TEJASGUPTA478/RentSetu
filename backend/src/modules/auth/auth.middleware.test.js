import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'

process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/rentsetu_test'
process.env.JWT_SECRET ??= 'auth-tests-secret-with-at-least-32-characters'
process.env.NODE_ENV = 'test'

const { authenticate } = await import('../../middleware/authenticate.js')
const { authorize } = await import('../../middleware/authorize.js')

function authenticateRequest(authorization) {
  const req = {
    get: name => name === 'authorization' ? authorization : undefined,
  }
  let error
  authenticate(req, {}, nextError => { error = nextError })
  return { req, error }
}

test('authentication attaches identity from a valid bearer token', () => {
  const token = jwt.sign(
    { id: 'user-1', role: 'LANDLORD', email: 'owner@example.com' },
    process.env.JWT_SECRET
  )

  const { req, error } = authenticateRequest(`Bearer ${token}`)

  assert.equal(error, undefined)
  assert.deepEqual(req.user, {
    id: 'user-1',
    role: 'LANDLORD',
    email: 'owner@example.com',
  })
})

test('authentication rejects an invalid bearer token', () => {
  const { error } = authenticateRequest('Bearer invalid-token')

  assert.equal(error?.statusCode, 401)
})

test('authorization rejects a role outside the route policy', () => {
  let error
  authorize('LANDLORD', 'MANAGER')({ user: { role: 'TENANT' } }, {}, nextError => { error = nextError })

  assert.equal(error?.statusCode, 403)
})
