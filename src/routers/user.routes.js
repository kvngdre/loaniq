import { Router } from 'express'
import upload from '../middleware/fileUploader'
import userConfigRoutes from './userConfig.routes'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'

const router = Router({ mergeParams: true })

router.use('/:userId/configurations', userConfigRoutes)

router.post('/', [], UserController.createUser)

router.post('/:userId/change_password', [validateId], UserController.changePassword)

router.get('/', [], UserController.getUsers)

router.get('/:userId', [validateId], UserController.getUser)

router.get('/:userId/deactivate', [validateId], UserController.deactivateUser)

router.get('/:userId/reactivate', [validateId], UserController.reactivateUser)

router.get('/:userId/reset_password', [validateId], UserController.resetPassword)

router.patch('/:userId', [validateId], UserController.updateUser)

router.delete('/:userId', [validateId], UserController.deleteUser)

router.post('/uploads', [upload.single('avatar')], UserController.uploadFiles)

export default router
