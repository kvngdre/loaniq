// import { requiresAuth } from 'express-openid-connect'
import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'
import TenantController from '../controllers/tenant.controller.js'
import upload from '../middleware/fileUploader.js'
import validateId from '../middleware/validateId.js'
import tenantConfigRoutes from './tenantConfig.routes.js'
import walletRoutes from './wallet.routes.js'

const router = Router()

router.use('/configurations', tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign-up', TenantController.signUp)

router.post('/:tenantId/activate', [verifyJWT, validateId], TenantController.activateTenant)

router.post('/:tenantId/uploads', [verifyJWT, validateId, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'documents', maxCount: 5 }])], TenantController.uploadFiles)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get('/self', [verifyJWT], TenantController.getCurrentTenant)

router.get('/', [verifyJWT], TenantController.getTenants)

router.get('/:tenantId', [verifyJWT, validateId], TenantController.getTenant)

router.get('/:tenantId/deactivate', [verifyJWT, validateId], TenantController.deactivateTenant)

router.get('/:tenantId/public-url', [verifyJWT, validateId], TenantController.generatePublicUrl)

router.get('/:tenantId/reactivate', [verifyJWT, validateId], TenantController.reactivateTenant)

router.patch('/:tenantId', [verifyJWT, validateId], TenantController.updateTenant)

router.delete('/:tenantId', [verifyJWT, validateId], TenantController.deleteTenant)

export default router
