import { Router } from 'express'
import TenantController from '../controllers/tenant.controller'
import UserController from '../controllers/user.controller'

const router = Router()

router.post('/forgot_password', UserController.forgotPassword)

router.post('/sign_up', TenantController.signUp)

router.get('/forms/:formId', TenantController.getPublicFormData)

export default router
