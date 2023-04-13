import { roles } from '../config/index.js'
import { Router } from 'express'
import finder from '../middleware/finder.js'
import grantAccess from '../middleware/grantAccess.js'
import isOwner from '../middleware/isOwner.js'
import upload from '../middleware/fileUploader.js'
import userConfigRouter from './userConfig.routes.js'
import UserController from '../controllers/user.controller.js'
import validateObjectId from '../middleware/validateObjectId.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

const { SUPER_ADMIN, ADMIN, EDITOR } = roles

router.use('/configurations', [verifyJWT], userConfigRouter)

router.post('/', [verifyJWT, grantAccess(SUPER_ADMIN, ADMIN)], UserController.createUser)

router.post('/forgot-password', UserController.forgotPassword)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

router.post('/verify-signUp', UserController.verifySignUp)

router.post('/:userId/update-password', [verifyJWT], UserController.updatePassword)

router.post('/:userId/deactivate', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deactivateUser)

router.get('/', [verifyJWT, grantAccess('all')], UserController.getUsers)

router.get('/me', [finder, verifyJWT], UserController.getCurrentUser)

router.get('/:userId', [verifyJWT, validateObjectId, grantAccess('all')], UserController.getUser)

router.get('/:userId/reactivate', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.reactivateUser)

router.get('/:userId/reset-password', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.resetPassword)

router.patch('/:userId', [verifyJWT, validateObjectId, grantAccess('all'), isOwner(EDITOR)], UserController.updateUser)

router.delete('/:userId', [verifyJWT, validateObjectId, grantAccess(SUPER_ADMIN, ADMIN)], UserController.deleteUser)

export default router
