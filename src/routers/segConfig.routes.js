import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT'
import SegConfigController from '../controllers/segConfig.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.post('/', [verifyJWT], SegConfigController.createSegConfig)

router.get('/', SegConfigController.getSegConfigs)

router.get('/:segConfigId', [validateId], SegConfigController.getSegConfig)

router.patch('/:segConfigId', [validateId], SegConfigController.updateConfig)

router.delete('/:segConfigId', [validateId], SegConfigController.deleteSegConfig)

export default router
