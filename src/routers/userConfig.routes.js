import { Router } from 'express'
import UserConfigController from '../controllers/userConfig.controller.js'
import validateId from '../middleware/validateId.js'

const router = Router({ mergeParams: true })

router.post('/', [], UserConfigController.createConfig)

router.get('/', [], UserConfigController.getUserConfigs)

router.get('/:userId', [validateId], UserConfigController.getUserConfig)

router.patch('/:userId', [validateId], UserConfigController.updateUserConfig)

router.delete('/:userId', [validateId], UserConfigController.deleteUserConfig)

export default router
