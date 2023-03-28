import { Router } from 'express'
import { roles } from '../config'
import verifyJWT from '../middleware/verifyJWT'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.createConfig)

router.get('/', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/:tenantId', [verifyJWT], TenantConfigController.getConfig)

router.patch('/:tenantId', [verifyJWT], TenantConfigController.updateConfig)

router.delete('/:tenantId', [verifyJWT, grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
