import { Router } from 'express'
import upload from '../middleware/fileUploader'
import userConfigRoutes from './userConfig.routes'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'
import { roles } from '../config'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'
import UserConfigController from '../controllers/userConfig.controller'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN, DIRECTOR, ADMIN, EDITOR } = roles

router.post('/', [grantAccess(SUPER_ADMIN)], UserController.createUser)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

router.post('/:userId/change_password', [validateId, grantAccess('all'), isOwner('all')], UserController.changePassword)

router.get('/', [grantAccess('all')], UserController.getUsers)

router.get('/configurations', [grantAccess(SUPER_ADMIN)], UserConfigController.getUserConfigs)

router.get('/:userId', [validateId, grantAccess('all')], UserController.getUser)

router.get('/:userId/deactivate', [validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.deactivateUser)

router.get('/:userId/reactivate', [validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.reactivateUser)

router.get('/:userId/reset_password', [validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.resetPassword)

router.patch('/:userId', [validateId, grantAccess('all'), isOwner(EDITOR)], UserController.updateUser)

router.delete('/:userId', [validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.deleteUser)

router.use('/:userId/configurations', [validateId], userConfigRoutes)

export default router
