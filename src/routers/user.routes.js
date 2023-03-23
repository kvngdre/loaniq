import { roles } from '../config'
import { Router } from 'express'
import verifyJwt from '../middleware/verifyJwt'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner.middleware'
import upload from '../middleware/fileUploader'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'
import userConfigRouter from './userConfig.routes'

const router = Router()

const { SUPER_ADMIN, ADMIN, EDITOR } = roles

router.use('/configurations', userConfigRouter)

router.post('/', [verifyJwt, grantAccess(SUPER_ADMIN, ADMIN)], UserController.createUser)

router.post('/forgot-password', UserController.forgotPassword)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

router.post('/:userId/change-password', [verifyJwt, validateId, grantAccess('all'), isOwner('all')], UserController.changePassword)

router.post('/:userId/deactivate', [verifyJwt, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deactivateUser)

router.get('/', [verifyJwt, grantAccess('all')], UserController.getUsers)

router.get('/:userId', [verifyJwt, validateId, grantAccess('all')], UserController.getUser)

router.get('/:userId/reactivate', [verifyJwt, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.reactivateUser)

router.get('/:userId/reset-password', [verifyJwt, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.resetPassword)

router.patch('/:userId', [verifyJwt, validateId, grantAccess('all'), isOwner(EDITOR)], UserController.updateUser)

router.delete('/:userId', [verifyJwt, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deleteUser)

export default router
