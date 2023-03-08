import { Router } from 'express'
import auth from '../middleware/auth'
// import tenantConfigRoutes from './tenantConfig.routes'
import TenantController from '../controllers/tenant.controller'
// import upload from '../middleware/fileUploader'
// import validateId from '../middleware/validateId'
// import walletRoutes from './wallet.routes'
// import userRoutes from './user.routes'
import { roles } from '../config'
import grantAccess from '../middleware/grantAccess'
import tenantRouter from './tenant.routes'
import validateId from '../middleware/validateId'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.get('/all', [auth, grantAccess(SUPER_ADMIN)], TenantController.getTenants)

// router.get('/configurations/all', [grantAccess(roles.SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/forms/:formId', TenantController.getPublicFormData)

router.get('/self', [auth], TenantController.getCurrentTenant)

router.post('/sign_up', TenantController.signUp)

router.use('/:tenantId', [auth, validateId], tenantRouter)

export default router
