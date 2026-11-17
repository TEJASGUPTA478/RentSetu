import assert from 'node:assert/strict'
import test from 'node:test'
import { loginSchema, registerSchema } from './auth.validation.js'

test('public registration defaults to a landlord account', () => {
  const parsed = registerSchema.parse({
    name: 'Test Landlord',
    email: '  LANDLORD@example.com ',
    password: 'Password@123',
  })

  assert.equal(parsed.role, 'LANDLORD')
  assert.equal(parsed.email, 'landlord@example.com')
})

test('public registration rejects manager and tenant role assignments', () => {
  const details = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'Password@123',
  }

  assert.throws(() => registerSchema.parse({ ...details, role: 'MANAGER' }))
  assert.throws(() => registerSchema.parse({ ...details, role: 'TENANT' }))
})

test('login normalizes email and rejects an empty password', () => {
  assert.equal(
    loginSchema.parse({ email: '  USER@example.com ', password: 'secret' }).email,
    'user@example.com'
  )
  assert.equal(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success, false)
})
