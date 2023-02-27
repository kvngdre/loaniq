import Router from 'express'
import upload from '../middleware/fileUpload'
// import verifyRole from '../middleware/verifyRole'
import auth from '../middleware/auth'
import userConfigRoutes from './userConfig.routes'
import UserController from '../controllers/user.controller'
import validateId from '../middleware/validateId'

const router = Router()

router.use('/configurations', [auth], userConfigRoutes)

router.post('/', [auth], UserController.createUser)

router.post('/:userId/change_password', [auth, validateId], UserController.changePassword)

router.post('/:userId/reset_password', [auth, validateId], UserController.resetPassword)

router.get('/', [auth], UserController.getUsers)

router.get('/:userId', [auth, validateId], UserController.getUser)

router.get('/:userId/deactivate', [auth, validateId], UserController.deactivateUser)

router.get('/:userId/reactivate', [auth, validateId], UserController.reactivateUser)

router.patch('/:userId', [validateId], UserController.updateUser)

router.delete('/:userId', [validateId], UserController.deleteUser)

router.post('/upload-photo', [upload.single('photo')], async (req, res) => {
  console.log(req.file)
  return res.status(200).json('Image uploaded')
})

export default router
