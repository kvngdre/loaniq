import { roles } from '../config'
import { Router } from 'express'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'
import UserConfigController from '../controllers/userConfig.controller'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN } = roles

router.post('/', [grantAccess(SUPER_ADMIN)], UserConfigController.createConfig)

router.get('/', [grantAccess('all'), isOwner('all')], UserConfigController.getUserConfig)

router.patch('/', [grantAccess('all'), isOwner('all')], UserConfigController.updateUserConfig)

router.delete('/', [grantAccess(SUPER_ADMIN)], UserConfigController.deleteUserConfig)

export default router
