import { userRoles } from '../utils/constants'
import Router from 'express'
import ServerError from '../errors/serverError'
import upload from '../middleware/fileUpload'
import { create, verifySignUp, getAll, requestOtp, getOne, update, changePassword, resetPassword, deactivate, delete_ } from '../controllers/userController'
import { create as _create, verify, update as _update, password } from '../validators/userValidator'
import verifyRole from '../middleware/verifyRole'
import verifyToken from '../middleware/verifyToken'
import settingsRoutes from './settings.routes'

const router = Router()

router.use('/settings', settingsRoutes)

router.post(
  '/',
  verifyToken,
  async (req, res) => {
    const { error } = _create(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const newUser = await create(req.user, req.body)
    if (newUser instanceof ServerError) { return res.status(newUser.errorCode).json(newUser.message) }

    return res.status(201).json(newUser)
  }
)

router.post('/verify', async (req, res) => {
  const { error } = verify(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const isVerified = await verifySignUp(
    req.body.email,
    req.body.currentPassword,
    req.body.newPassword,
    req.body.otp,
    req.cookies,
    res
  )
  if (isVerified instanceof ServerError) { return res.status(isVerified.errorCode).json(isVerified.message) }

  return res.status(isVerified.code).json(isVerified.payload)
})

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  console.log(req.file)
  return res.status(200).json('Image uploaded')
})

/**
 * @queryParam name Filter by name.
 * @queryParam lender Filter by lender.
 * @queryParam role Filter by role.
 * @queryParam sort Field to sort by. Defaults to 'first name'.
 */
router.get('/', verifyToken, async (req, res) => {
  const users = await getAll(req.user, req.query)
  if (users instanceof ServerError) { return res.status(users.errorCode).json(users.message) }

  return res.status(200).json(users)
})

/**
 * @queryParam email The user's email.
 */
router.get('/otp', async (req, res) => {
  const response = await requestOtp(req.query.email)
  if (response instanceof ServerError) { return res.status(response.errorCode).json(response.message) }

  return res.status(200).json(response)
})

/**
 * @urlParam {string} id The id of the user.
 */
router.get(
  '/:id',
  verifyToken,
  async (req, res) => {
    const id = req.params.id !== undefined ? req.params.id : req.user.id

    const user = await getOne(req.params.id, req.user)
    if (user instanceof ServerError) { return res.status(user.errorCode).json(user.message) }

    return res.status(200).json(user)
  }
)

/**
 * @urlParam {string} id The id of the user.
 */
router.patch('/:id?', verifyToken, async (req, res) => {
  const { error } = _update(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const id = req.params.id !== undefined ? req.params.id : req.user.id

  const user = await update(id, req.user, req.body)
  if (user instanceof ServerError) { return res.status(user.errorCode).json(user.message) }

  return res.status(200).json(user)
})

router.post('/change-password', verifyToken, async (req, res) => {
  const { error } = password(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const response = await changePassword(req.user, req.body)
  if (response instanceof ServerError) { return res.status(response.errorCode).json(response.message) }

  return res.status(200).json(response)
})

/**
 * @urlParam {string} id The id of the user.
 */
router.get(
  '/reset-password/:id',
  verifyToken,
  async (req, res) => {
    const user = await resetPassword(req.params.id)
    if (user instanceof ServerError) { return res.status(user.errorCode).json(user.message) }

    return res.status(200).json(user)
  }
)

/**
 * @urlParam {string} id The id of the user.
 */
router.post(
  '/deactivate/:id',
  verifyToken,
  async (req, res) => {
    const user = await deactivate(
      req.params.id,
      req.user,
      req.body.password
    )
    if (user instanceof ServerError) { return res.status(user.errorCode).json(user.message) }

    return res.status(200).json(user)
  }
)

/**
 * @urlParam {string} id The id of the user.
 */
router.delete(
  '/:id',
  verifyToken,
  async (req, res) => {
    const deletedUser = await delete (
      req.params.id,
      req.user,
      req.body.password
    )
    if (deletedUser instanceof Error) { return res.status(deletedUser.errorCode).json(deletedUser.message) }

    return res.status(204).json(deletedUser)
  }
)

export default router
