import { Router } from 'express'
import authRouter from '../modules/auth/auth.routes.js'
import usersRouter from '../modules/users/users.routes.js'
import propertiesRouter from '../modules/properties/properties.routes.js'
import unitsRouter from '../modules/units/units.routes.js'
import tenantsRouter from '../modules/tenants/tenants.routes.js'
import leasesRouter from '../modules/leases/leases.routes.js'
import paymentsRouter from '../modules/payments/payments.routes.js'
import maintenanceRouter from '../modules/maintenance/maintenance.routes.js'
import dashboardRouter from '../modules/dashboard/dashboard.routes.js'

const router = Router()
router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/properties', propertiesRouter)
router.use('/units', unitsRouter)
router.use('/tenants', tenantsRouter)
router.use('/leases', leasesRouter)
router.use('/payments', paymentsRouter)
router.use('/maintenance', maintenanceRouter)
router.use('/dashboard', dashboardRouter)

export default router
