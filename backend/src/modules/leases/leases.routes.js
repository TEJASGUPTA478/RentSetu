import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as leasesController from './leases.controller.js'
import {
  createLeaseSchema,
  leaseIdParamSchema,
  leaseQuerySchema,
  updateLeaseSchema,
} from './leases.validation.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ query: leaseQuerySchema }),
  asyncHandler(leasesController.listLeases)
)

router.post(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ body: createLeaseSchema }),
  asyncHandler(leasesController.createLease)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: leaseIdParamSchema }),
  asyncHandler(leasesController.getLease)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: leaseIdParamSchema, body: updateLeaseSchema }),
  asyncHandler(leasesController.updateLease)
)

router.delete(
  '/:id',
  authorize('LANDLORD'),
  validate({ params: leaseIdParamSchema }),
  asyncHandler(leasesController.deleteLease)
)

export default router
