import { Router } from 'express'
import { roles } from '../config'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router()

const { SUPER_ADMIN, DIRECTOR } = roles

router.post('/', [grantAccess(SUPER_ADMIN, DIRECTOR)], TenantConfigController.createConfig)

router.get('/', [grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/:tenantId', TenantConfigController.getConfig)

router.patch('/:tenantId', [grantAccess(DIRECTOR)], TenantConfigController.updateConfig)

router.delete('/:tenantId', [grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
