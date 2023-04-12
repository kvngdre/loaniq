import { Router } from 'express'
import { roles } from '../config/index.js'
import verifyJWT from '../middleware/verifyJWT.js'
import grantAccess from '../middleware/grantAccess.js'
import TenantConfigController from '../controllers/tenantConfig.controller.js'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.createConfig)

router.get('/', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/:tenantId', [verifyJWT], TenantConfigController.getConfig)

router.patch('/:tenantId', [verifyJWT], TenantConfigController.updateConfig)

router.delete('/:tenantId', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
