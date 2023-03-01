import auth from '../middleware/auth'
import Router from 'express'
import tenantConfigRoutes from './tenantConfig.routes'
import TenantController from '../controllers/tenant.controller'
import upload from '../middleware/fileUploader'
import validateId from '../middleware/validateId'
import walletRoutes from './wallet.routes'

const router = Router()

router.use('/configurations', [auth], tenantConfigRoutes)

router.use('/wallets', walletRoutes)

router.post('/sign_up', TenantController.signUp)

router.post('/:tenantId/activate', [validateId], TenantController.activateTenant)

router.get('/', TenantController.getTenants)

router.get('/deactivate', [auth, validateId], TenantController.deactivateTenant)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get('/mine', TenantController.getCurrentTenant)

router.get('/:tenantId/public_url', [validateId], TenantController.generatePublicUrl)

router.get('/:tenantId/reactivate', [validateId], TenantController.reactivateTenant)

router.get('/:tenantId', [validateId], TenantController.getTenants)

router.patch('/:tenantId', [validateId], TenantController.updateTenant)

router.delete('/:tenantId', [validateId], TenantController.deleteTenant)

router.post('/uploads', [auth, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'avatar', maxCount: 1 }])], TenantController.uploadFiles)

export default router
