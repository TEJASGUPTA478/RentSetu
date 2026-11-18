import { z } from 'zod'

export const maintenancePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  errorMap: () => ({ message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT' }),
})

export const maintenanceStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
  errorMap: () => ({ message: 'Status must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED' }),
})

export const createMaintenanceSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000, 'Description cannot exceed 2000 characters'),
  priority: maintenancePriorityEnum.optional().default('MEDIUM'),
  unitId: z.string().uuid('Invalid unit ID').optional(),
  leaseId: z.string().uuid('Invalid lease ID').optional(),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
})

export const updateMaintenanceStatusSchema = z
  .object({
    status: maintenanceStatusEnum.optional(),
    priority: maintenancePriorityEnum.optional(),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters').optional(),
    description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000, 'Description cannot exceed 2000 characters').optional(),
  })
  .refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export const maintenanceQuerySchema = z.object({
  status: maintenanceStatusEnum.optional(),
  priority: maintenancePriorityEnum.optional(),
  unitId: z.string().uuid('Invalid unit ID').optional(),
  propertyId: z.string().uuid('Invalid property ID').optional(),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
  leaseId: z.string().uuid('Invalid lease ID').optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const maintenanceIdParamSchema = z.object({
  id: z.string().uuid('Invalid maintenance request ID'),
})
