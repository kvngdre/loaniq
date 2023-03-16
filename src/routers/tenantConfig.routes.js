import { Router } from 'express'
import { roles } from '../config'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router()

const { SUPER_ADMIN, DIRECTOR } = roles

router.post('/', [auth, grantAccess(SUPER_ADMIN, DIRECTOR)], TenantConfigController.createConfig)

router.get('/', [auth, grantAccess(SUPER_ADMIN)], TenantConfigController.getConfigs)

router.get('/:tenantId', [auth], TenantConfigController.getConfig)

router.patch('/:tenantId', [auth, grantAccess(DIRECTOR)], TenantConfigController.updateConfig)

router.delete('/:tenantId', [auth, grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
