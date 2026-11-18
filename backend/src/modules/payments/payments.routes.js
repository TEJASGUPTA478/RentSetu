import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as paymentsController from './payments.controller.js'
import {
  createPaymentSchema,
  paymentIdParamSchema,
  paymentQuerySchema,
  updatePaymentSchema,
} from './payments.validation.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ query: paymentQuerySchema }),
  asyncHandler(paymentsController.listPayments)
)

router.post(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ body: createPaymentSchema }),
  asyncHandler(paymentsController.recordPayment)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: paymentIdParamSchema }),
  asyncHandler(paymentsController.getPayment)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: paymentIdParamSchema, body: updatePaymentSchema }),
  asyncHandler(paymentsController.updatePayment)
)

router.patch(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: paymentIdParamSchema, body: updatePaymentSchema }),
  asyncHandler(paymentsController.updatePayment)
)

export default router
