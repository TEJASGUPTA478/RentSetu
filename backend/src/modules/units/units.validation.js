import { z } from 'zod'

export const createUnitSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  unitNumber: z.string().trim().min(1, 'Unit number is required').max(50),
  rent: z.coerce.number().positive('Rent must be greater than 0'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms must be 0 or more'),
  status: z.enum(['VACANT', 'OCCUPIED']).optional().default('VACANT'),
})

export const updateUnitSchema = z.object({
  unitNumber: z.string().trim().min(1).max(50).optional(),
  rent: z.coerce.number().positive('Rent must be greater than 0').optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  status: z.enum(['VACANT', 'OCCUPIED']).optional(),
})

export const unitQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  status: z.enum(['VACANT', 'OCCUPIED']).optional(),
  search: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const unitIdParamSchema = z.object({
  id: z.string().uuid('Invalid unit ID'),
})

export const unitParamsSchema = unitIdParamSchema
