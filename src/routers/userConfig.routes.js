import { roles } from '../config'
import { Router } from 'express'
import verifyJwt from '../middleware/verifyJwt'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'
import UserConfigController from '../controllers/userConfig.controller'
import validateId from '../middleware/validateId'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN } = roles

router.post('/', [grantAccess(SUPER_ADMIN)], UserConfigController.createConfig)

router.get('/', [verifyJwt, grantAccess(SUPER_ADMIN)], UserConfigController.getUserConfigs)

router.get('/:userId', [validateId, grantAccess('all'), isOwner('all')], UserConfigController.getUserConfig)

router.patch('/:userId', [validateId, grantAccess('all'), isOwner('all')], UserConfigController.updateUserConfig)

router.delete('/:userId', [validateId, grantAccess(SUPER_ADMIN)], UserConfigController.deleteUserConfig)

export default router
