import { roles } from '../config'
import { Router } from 'express'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'
import tenantConfigRoutes from './tenantConfig.routes'
import TenantController from '../controllers/tenant.controller'
import upload from '../middleware/fileUploader'
import userRoutes from './user.routes'
import walletRoutes from './wallet.routes'
import validateId from '../middleware/validateId'

const { SUPER_ADMIN, DIRECTOR } = roles

const router = Router({ mergeParams: true })

router.get('/', [auth, grantAccess(SUPER_ADMIN)], TenantController.getTenants)

router.get('/configurations', [auth, grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/self', [auth], TenantController.getCurrentTenant)

router.get('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.getTenant)

router.patch('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.updateTenant)

router.delete('/:tenantId', [auth, validateId, grantAccess(SUPER_ADMIN)], TenantController.deleteTenant)

router.post('/:tenantId/activate', [auth, validateId, grantAccess(DIRECTOR)], TenantController.activateTenant)

router.get('/:tenantId/deactivate', [auth, validateId, grantAccess(DIRECTOR)], TenantController.deactivateTenant)

router.get('/:tenantId/public_url', [auth, validateId, grantAccess(DIRECTOR)], TenantController.generatePublicUrl)

router.get('/:tenantId/reactivate', [auth, validateId, grantAccess(SUPER_ADMIN)], TenantController.reactivateTenant)

router.post('/:tenantId/uploads', [auth, validateId, grantAccess(DIRECTOR), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'documents', maxCount: 5 }])], TenantController.uploadFiles)

router.use('/:tenantId/configurations', tenantConfigRoutes)

router.use('/:tenantId/users', userRoutes)

router.use('/:tenantId/wallet', walletRoutes)

export default router
