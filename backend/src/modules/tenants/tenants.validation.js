import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().min(1, 'Phone number is required').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  emergencyContactName: z.string().trim().max(100).nullable().optional(),
  emergencyContactPhone: z.string().trim().max(20).nullable().optional(),
  idProofType: z.string().trim().max(50).nullable().optional(),
  idProofNumber: z.string().trim().max(50).nullable().optional(),
})

export const updateTenantSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(1).max(20).optional(),
  emergencyContactName: z.string().trim().max(100).nullable().optional(),
  emergencyContactPhone: z.string().trim().max(20).nullable().optional(),
  idProofType: z.string().trim().max(50).nullable().optional(),
  idProofNumber: z.string().trim().max(50).nullable().optional(),
})

export const tenantQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const tenantIdParamSchema = z.object({
  id: z.string().uuid('Invalid tenant ID'),
})
