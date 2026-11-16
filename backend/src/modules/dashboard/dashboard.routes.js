import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { getLandlordDashboard, getTenantDashboard } from './dashboard.controller.js'

const router = Router()
router.get('/landlord', authenticate, authorize('LANDLORD', 'MANAGER'), asyncHandler(getLandlordDashboard))
router.get('/tenant', authenticate, authorize('TENANT'), asyncHandler(getTenantDashboard))

export default router
