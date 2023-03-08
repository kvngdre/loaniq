import { roles } from '../config'
import { Router } from 'express'
import grantAccess from '../middleware/grantAccess'
import tenantConfigRoutes from './tenantConfig.routes'
import TenantController from '../controllers/tenant.controller'
import upload from '../middleware/fileUploader'
import userRoutes from './user.routes'
import walletRoutes from './wallet.routes'

const { SUPER_ADMIN, DIRECTOR } = roles

const router = Router({ mergeParams: true })

router.get('/', [grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.getTenant)

router.patch('/', [grantAccess(SUPER_ADMIN, DIRECTOR)], TenantController.updateTenant)

router.delete('/', [grantAccess(SUPER_ADMIN)], TenantController.deleteTenant)

router.post('/activate', [grantAccess(DIRECTOR)], TenantController.activateTenant)

router.use('/configurations', tenantConfigRoutes)

router.get('/deactivate', [grantAccess(DIRECTOR)], TenantController.deactivateTenant)

router.get('/public_url', [grantAccess(DIRECTOR)], TenantController.generatePublicUrl)

router.get('/reactivate', [grantAccess(SUPER_ADMIN)], TenantController.reactivateTenant)

router.post('/uploads', [grantAccess(DIRECTOR), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'documents', maxCount: 5 }])], TenantController.uploadFiles)

router.use('/users', userRoutes)

router.use('/wallet', walletRoutes)

export default router
