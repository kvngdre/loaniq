// import { requiresAuth } from 'express-openid-connect'
import { roles } from '../config'
import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT'
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

router.post('/:tenantId/activate', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.activateTenant)

router.post('/:tenantId/uploads', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'documents', maxCount: 5 }])], TenantController.uploadFiles)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get('/self', [verifyJWT], TenantController.getCurrentTenant)

router.get('/', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantController.getTenants)

router.get('/:tenantId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.getTenant)

router.get('/:tenantId/deactivate', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.deactivateTenant)

router.get('/:tenantId/public-url', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.generatePublicUrl)

router.get('/:tenantId/reactivate', [verifyJWT, validateId, grantAccess(SUPER_ADMIN)], TenantController.reactivateTenant)

router.patch('/:tenantId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.updateTenant)

router.delete('/:tenantId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN)], TenantController.deleteTenant)

export default router
