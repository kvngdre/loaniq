import { roles } from '../config'
import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT'
import grantAccess from '../middleware/grantAccess'
import isOwner from '../middleware/isOwner'
import upload from '../middleware/fileUploader'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'
import userConfigRouter from './userConfig.routes'
import finder from '../middleware/finder'

const router = Router()

const { SUPER_ADMIN, ADMIN, EDITOR } = roles

router.use('/configurations', [verifyJWT], userConfigRouter)

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN, ADMIN)], UserController.createUser)

router.post('/forgot-password', UserController.forgotPassword)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

router.post('/verify-signUp', UserController.verifySignUp)

router.post('/:userId/update-password', [verifyJWT], UserController.updatePassword)

router.post('/:userId/deactivate', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deactivateUser)

router.get('/', [verifyJWT, grantAccess('all')], UserController.getUsers)

router.get('/me', [finder, verifyJWT], UserController.getCurrentUser)

router.get('/:userId', [verifyJWT, validateId, grantAccess('all')], UserController.getUser)

router.get('/:userId/reactivate', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.reactivateUser)

router.get('/:userId/reset-password', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.resetPassword)

router.patch('/:userId', [verifyJWT, validateId, grantAccess('all'), isOwner(EDITOR)], UserController.updateUser)

router.delete('/:userId', [verifyJWT, validateId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deleteUser)

export default router
