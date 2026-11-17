import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as unitsController from './units.controller.js'
import {
  createUnitSchema,
  unitIdParamSchema,
  unitQuerySchema,
  updateUnitSchema,
} from './units.validation.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ query: unitQuerySchema }),
  asyncHandler(unitsController.listUnits)
)

router.post(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ body: createUnitSchema }),
  asyncHandler(unitsController.createUnit)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: unitIdParamSchema }),
  asyncHandler(unitsController.getUnit)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: unitIdParamSchema, body: updateUnitSchema }),
  asyncHandler(unitsController.updateUnit)
)

router.delete(
  '/:id',
  authorize('LANDLORD'),
  validate({ params: unitIdParamSchema }),
  asyncHandler(unitsController.deleteUnit)
)

export default router
