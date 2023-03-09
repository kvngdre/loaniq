import { Router } from 'express'
import TenantController from '../controllers/tenant.controller'
import UserController from '../controllers/user.controller'

const router = Router()

router.post('/forgot_password', UserController.forgotPassword)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.post('/sign_up', TenantController.signUp)

export default router
