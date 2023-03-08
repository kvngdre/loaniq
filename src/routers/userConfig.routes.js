import { Router } from 'express'
import UserConfigController from '../controllers/userConfig.controller'
import validateId from '../middleware/validateId'

const router = Router({ mergeParams: true })

router.post('/', UserConfigController.createSettings)

router.get('/', UserConfigController.getUserConfigs)

router.get('/:userId', [validateId], UserConfigController.getUserConfig)

router.patch('/:userId', [validateId], UserConfigController.updateUserConfig)

router.delete('/:userId', [validateId], UserConfigController.deleteUserConfig)

export default router
