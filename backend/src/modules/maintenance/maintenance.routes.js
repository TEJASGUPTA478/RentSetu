import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as maintenanceController from './maintenance.controller.js'
import {
  createMaintenanceSchema,
  maintenanceIdParamSchema,
  maintenanceQuerySchema,
  updateMaintenanceStatusSchema,
} from './maintenance.validation.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ query: maintenanceQuerySchema }),
  asyncHandler(maintenanceController.listMaintenanceRequests)
)

router.post(
  '/',
  authorize('TENANT', 'LANDLORD', 'MANAGER'),
  validate({ body: createMaintenanceSchema }),
  asyncHandler(maintenanceController.createMaintenanceRequest)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: maintenanceIdParamSchema }),
  asyncHandler(maintenanceController.getMaintenanceRequest)
)

router.patch(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: maintenanceIdParamSchema, body: updateMaintenanceStatusSchema }),
  asyncHandler(maintenanceController.updateMaintenanceRequest)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: maintenanceIdParamSchema, body: updateMaintenanceStatusSchema }),
  asyncHandler(maintenanceController.updateMaintenanceRequest)
)

router.patch(
  '/:id/status',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: maintenanceIdParamSchema, body: updateMaintenanceStatusSchema }),
  asyncHandler(maintenanceController.updateMaintenanceRequest)
)

router.delete(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: maintenanceIdParamSchema }),
  asyncHandler(maintenanceController.deleteMaintenanceRequest)
)

export default router
