import { Router } from 'express'
import { roles } from '../config'
import grantAccess from '../middleware/grantAccess'
import TenantConfigController from '../controllers/tenantConfig.controller'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN, DIRECTOR } = roles

router.post('/', [grantAccess(SUPER_ADMIN, DIRECTOR)], TenantConfigController.createConfig)

router.get('/', TenantConfigController.getConfig)

router.patch('/', [grantAccess(DIRECTOR)], TenantConfigController.updateConfig)

router.delete('/', [grantAccess(SUPER_ADMIN)], TenantConfigController.deleteConfig)

export default router
