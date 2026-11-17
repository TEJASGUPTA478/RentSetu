import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/authenticate.js'
import * as authValidation from './auth.validation.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/register', validate({ body: authValidation.registerSchema }), authController.register)
router.post('/login', validate({ body: authValidation.loginSchema }), authController.login)
router.get('/me', authenticate, authController.getMe)
router.post('/change-password', authenticate, validate({ body: authValidation.changePasswordSchema }), authController.changePassword)

export default router
