import { z } from 'zod'

export const createPropertySchema = z.object({
  name: z.string().trim().min(1, 'Property name is required').max(100, 'Property name must be at most 100 characters'),
  address: z.string().trim().min(1, 'Address is required').max(255),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pincode: z.string().trim().min(1, 'Pincode is required').max(20),
  type: z.string().trim().min(1, 'Property type is required').max(50),
  managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
})

export const updatePropertySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  pincode: z.string().trim().min(1).max(20).optional(),
  type: z.string().trim().min(1).max(50).optional(),
  managerId: z.string().uuid('Invalid manager ID').nullable().optional(),
})

export const propertyQuerySchema = z.object({
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  type: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const propertyIdParamSchema = z.object({
  id: z.string().uuid('Invalid property ID'),
})

export const propertyParamsSchema = propertyIdParamSchema
