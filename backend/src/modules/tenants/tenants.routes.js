import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { validate } from '../../middleware/validate.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as tenantsController from './tenants.controller.js'
import {
  createTenantSchema,
  tenantIdParamSchema,
  tenantQuerySchema,
  updateTenantSchema,
} from './tenants.validation.js'

const router = Router()

router.use(authenticate)

router.get('/me', authorize('TENANT'), asyncHandler(tenantsController.getMyProfile))

router.get(
  '/',
  authorize('LANDLORD', 'MANAGER'),
  validate({ query: tenantQuerySchema }),
  asyncHandler(tenantsController.listTenants)
)

router.post(
  '/',
  authorize('LANDLORD'),
  validate({ body: createTenantSchema }),
  asyncHandler(tenantsController.createTenant)
)

router.get(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: tenantIdParamSchema }),
  asyncHandler(tenantsController.getTenant)
)

router.put(
  '/:id',
  authorize('LANDLORD', 'MANAGER', 'TENANT'),
  validate({ params: tenantIdParamSchema, body: updateTenantSchema }),
  asyncHandler(tenantsController.updateTenant)
)

router.delete(
  '/:id',
  authorize('LANDLORD'),
  validate({ params: tenantIdParamSchema }),
  asyncHandler(tenantsController.deleteTenant)
)

export default router
