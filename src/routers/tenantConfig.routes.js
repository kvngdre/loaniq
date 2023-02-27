import Router from 'express'
import TenantConfigController from '../controllers/tenantConfig.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', TenantConfigController.createConfig)

router.get('/', TenantConfigController.getConfigs)

router.get('/:tenantId', [validateId], TenantConfigController.getConfig)

router.patch('/:tenantId', [validateId], TenantConfigController.updateConfig)

router.delete('/:tenantId', [validateId], TenantConfigController.deleteConfig)

export default router
