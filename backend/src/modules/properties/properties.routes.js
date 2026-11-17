import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as propertiesController from './properties.controller.js'
import {
  createPropertySchema,
  propertyIdParamSchema,
  propertyQuerySchema,
  updatePropertySchema,
} from './properties.validation.js'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ query: propertyQuerySchema }),
  asyncHandler(propertiesController.listProperties)
)

router.post(
  '/',
  authorize('LANDLORD'),
  validate({ body: createPropertySchema }),
  asyncHandler(propertiesController.createProperty)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: propertyIdParamSchema }),
  asyncHandler(propertiesController.getProperty)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER'),
  validate({ params: propertyIdParamSchema, body: updatePropertySchema }),
  asyncHandler(propertiesController.updateProperty)
)

router.delete(
  '/:id',
  authorize('LANDLORD'),
  validate({ params: propertyIdParamSchema }),
  asyncHandler(propertiesController.deleteProperty)
)

export default router
