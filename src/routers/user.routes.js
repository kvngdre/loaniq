import { roles } from '../config'
import { Router } from 'express'
import auth from '../middleware/auth'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'
import upload from '../middleware/fileUploader'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'

const router = Router()

const { SUPER_ADMIN, DIRECTOR, ADMIN, EDITOR } = roles

router.post('/', [auth, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.createUser)

router.post('/forgot-password', UserController.forgotPassword)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

router.post('/:userId/change-password', [auth, validateId, grantAccess('all'), isOwner('all')], UserController.changePassword)

router.get('/', [auth, grantAccess('all')], UserController.getUsers)

router.get('/:userId', [auth, validateId, grantAccess('all')], UserController.getUser)

router.get('/:userId/configurations', [auth, grantAccess('all'), isOwner('all')], UserController.getConfig)

router.get('/:userId/deactivate', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.deactivateUser)

router.get('/:userId/reactivate', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.reactivateUser)

router.get('/:userId/reset_password', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.resetPassword)

router.patch('/:userId', [auth, validateId, grantAccess('all'), isOwner(EDITOR)], UserController.updateUser)

router.patch('/:userId/configurations', [auth, validateId, grantAccess('all'), isOwner('all')], UserController.updateUserConfig)

router.delete('/:userId', [auth, validateId, grantAccess(SUPER_ADMIN, DIRECTOR, ADMIN)], UserController.deleteUser)

export default router
