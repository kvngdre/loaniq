import TenantConfigController from '../controllers/tenantConfig.controller'
import Router from 'express'

const router = Router()

router.post('/', TenantConfigController.createConfigurations)

router.get('/', TenantConfigController.getConfigurations)

router.get('/:tenantId', TenantConfigController.getConfigurations)

export default router
