import Router from 'express'
import upload from '../middleware/fileUploader'
// import verifyRole from '../middleware/verifyRole'
import auth from '../middleware/auth'
import userConfigRoutes from './userConfig.routes'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.use('/configurations', [auth], userConfigRoutes)

router.post('/', [auth], UserController.createUser)

router.post('/:userId/change_password', [auth, validateId], UserController.changePassword)

router.get('/', [auth], UserController.getUsers)

router.get('/:userId', [auth, validateId], UserController.getUser)

router.get('/:userId/deactivate', [auth, validateId], UserController.deactivateUser)

router.get('/:userId/reactivate', [auth, validateId], UserController.reactivateUser)

router.get('/:userId/reset_password', [auth, validateId], UserController.resetPassword)

router.patch('/:userId', [validateId], UserController.updateUser)

router.delete('/:userId', [validateId], UserController.deleteUser)

router.post('/uploads', [auth, upload.single('avatar')], UserController.uploadFiles)

export default router
