import { z } from 'zod'

export const paymentMethodEnum = z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'], {
  errorMap: () => ({ message: 'Method must be one of: CASH, UPI, BANK_TRANSFER, CHEQUE, CARD' }),
})

export const createPaymentSchema = z.object({
  leaseId: z.string().uuid('Invalid lease ID'),
  billingMonth: z.coerce.date({ invalid_type_error: 'Invalid billing month' }),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: paymentMethodEnum,
  paidOn: z.coerce.date({ invalid_type_error: 'Invalid payment date' }).optional(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
})

export const updatePaymentSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than 0').optional(),
    method: paymentMethodEnum.optional(),
    billingMonth: z.coerce.date({ invalid_type_error: 'Invalid billing month' }).optional(),
    paidOn: z.coerce.date({ invalid_type_error: 'Invalid payment date' }).optional(),
    notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').nullable().optional(),
  })
  .refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  )

export const paymentQuerySchema = z.object({
  leaseId: z.string().uuid('Invalid lease ID').optional(),
  propertyId: z.string().uuid('Invalid property ID').optional(),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
  method: paymentMethodEnum.optional(),
  billingMonth: z.coerce.date({ invalid_type_error: 'Invalid billing month' }).optional(),
  startDate: z.coerce.date({ invalid_type_error: 'Invalid start date' }).optional(),
  endDate: z.coerce.date({ invalid_type_error: 'Invalid end date' }).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export const paymentIdParamSchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
})
