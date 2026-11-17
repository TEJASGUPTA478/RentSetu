import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../utils/ApiError.js'

export function sanitizeUser(user) {
  if (!user) return null
  const { passwordHash, ...safeUser } = user
  return safeUser
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'LANDLORD',
      isActive: true,
    },
    include: {
      tenantProfile: true,
    },
  })

  const token = generateToken(user)
  return { user: sanitizeUser(user), token }
}

export async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      tenantProfile: true,
    },
  })

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated. Please contact your property administrator.')
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password')
  }

  const token = generateToken(user)
  return { user: sanitizeUser(user), token }
}

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tenantProfile: {
        include: {
          leases: {
            where: { status: 'ACTIVE' },
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user || !user.isActive) {
    throw ApiError.notFound('User not found or account is deactivated')
  }

  return sanitizeUser(user)
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw ApiError.notFound('User not found')
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect')
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  })

  return { message: 'Password updated successfully' }
}
