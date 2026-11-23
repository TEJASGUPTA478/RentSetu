import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { listManagers } from './users.controller.js'

const router = Router()
router.use(authenticate)
router.get('/managers', authorize('LANDLORD'), asyncHandler(listManagers))

export default router
