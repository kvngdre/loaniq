import { Router } from 'express'
import upload from '../middleware/fileUploader'
import userConfigRoutes from './userConfig.routes'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'
import { roles } from '../config'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'

const router = Router({ mergeParams: true })

const { SUPER_ADMIN, DIRECTOR, ADMIN, EDITOR } = roles

router.use('/:userId/configurations', userConfigRoutes)

router.post('/', [grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.createUser)

router.get('/', [grantAccess('all')], UserController.getUsers)

router.get('/:userId', [grantAccess('all'), validateId], UserController.getUser)

router.post('/:userId/change_password', [grantAccess('all'), isOwner('all'), validateId], UserController.changePassword)

router.get('/:userId/deactivate', [grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN), isOwner(ADMIN), validateId], UserController.deactivateUser)

router.get('/:userId/reactivate', [grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN), validateId], UserController.reactivateUser)

router.get('/:userId/reset_password', [grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN), validateId], UserController.resetPassword)

router.patch('/:userId', [grantAccess('all'), isOwner(EDITOR), validateId], UserController.updateUser)

router.delete('/:userId', [grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN), validateId], UserController.deleteUser)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

export default router
