import { Router } from 'express'
import { roles } from '../config'
import verifyJwt from '../middleware/verifyJwt'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router()

const { SUPER_ADMIN } = roles

router.post('/', [verifyJwt, grantAccess(SUPER_ADMIN)], TenantConfigController.createConfig)

router.get('/', [verifyJwt, grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/:tenantId', [verifyJwt], TenantConfigController.getConfig)

router.patch('/:tenantId', [verifyJwt], TenantConfigController.updateConfig)

router.delete('/:tenantId', [verifyJwt, grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
