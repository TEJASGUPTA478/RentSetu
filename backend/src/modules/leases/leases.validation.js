import { z } from 'zod'

export const createLeaseSchema = z
  .object({
    unitId: z.string().uuid('Invalid unit ID'),
    tenantId: z.string().uuid('Invalid tenant ID'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    monthlyRent: z.coerce.number().positive('Monthly rent must be greater than 0'),
    securityDeposit: z.coerce.number().min(0, 'Security deposit must be 0 or more'),
    dueDay: z.coerce.number().int().min(1, 'Due day must be between 1 and 28').max(28, 'Due day must be between 1 and 28'),
    status: z.enum(['ACTIVE', 'ENDED', 'TERMINATED']).optional().default('ACTIVE'),
  })
  .refine(data => data.startDate < data.endDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })

export const updateLeaseSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    monthlyRent: z.coerce.number().positive().optional(),
    securityDeposit: z.coerce.number().min(0).optional(),
    dueDay: z.coerce.number().int().min(1).max(28).optional(),
    status: z.enum(['ACTIVE', 'ENDED', 'TERMINATED']).optional(),
  })
  .refine(
    data => {
      if (data.startDate && data.endDate) {
        return data.startDate < data.endDate
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

export const leaseQuerySchema = z.object({
  propertyId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'ENDED', 'TERMINATED']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const leaseIdParamSchema = z.object({
  id: z.string().uuid('Invalid lease ID'),
})
