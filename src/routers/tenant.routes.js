// import { requiresAuth } from 'express-openid-connect'
import { roles } from '../config'
import { Router } from 'express'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import TenantController from '../controllers/tenant.controller'
import upload from '../middleware/fileUploader'
import validateId from '../middleware/validateId'
import tenantConfigRoutes from './tenantConfig.routes'
import walletRoutes from './wallet.routes'

const { SUPER_ADMIN, DIRECTOR } = roles

const router = Router()

router.use('/configurations', tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign-up', TenantController.signUp)

router.post('/:tenantId/activate', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.activateTenant)

router.post('/:tenantId/uploads', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'documents', maxCount: 5 }])], TenantController.uploadFiles)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get('/self', [auth], TenantController.getCurrentTenant)

router.get('/', [auth, grantAccess(SUPER_ADMIN)], TenantController.getTenants)

router.get('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.getTenant)

router.get('/:tenantId/deactivate', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.deactivateTenant)

router.get('/:tenantId/public-url', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.generatePublicUrl)

router.get('/:tenantId/reactivate', [auth, validateId, grantAccess(SUPER_ADMIN)], TenantController.reactivateTenant)

router.patch('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.updateTenant)

router.delete('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN)], TenantController.deleteTenant)

export default router
