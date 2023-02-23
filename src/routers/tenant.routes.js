import { roles } from '../utils/constants'
import auth from '../middleware/verifyToken'
import lenderController from '../controllers/tenant.controller'
import { validateUpdateTenantSettings, validateUpdateTenant, fundAccount } from '../validators/tenant.validator'
import Router from 'express'
import upload from '../middleware/fileUpload'
import validateObjectId from '../middleware/validateObjectId'
import verifyRole from '../middleware/verifyRole'

const router = Router()
const { admin, master, owner } = roles

router.post('/new', async (req, res) => {
  const response = await lenderController.createTenant(req.body)
  return res.status(response.code).json(response.payload)
})

router.post(
  '/activate/:tenantId?',
  [auth, verifyRole(master, owner), validateObjectId],
  async (req, res) => {
    console.log(req.user)
    const tenantId =
            req.params.tenantId !== undefined ? req.params.tenantId : req.user.tenantId

    const response = await lenderController.activateTenant(tenantId, req.body)
    return res.status(response.code).json(response.payload)
  }
)

/**
 * @queryParam name Filter by name.
 * @queryParam min Filter by min balance.
 * @queryParam max Filter by max balance.
 */
router.get(
  '/',
  [auth, verifyRole(master), validateObjectId],
  async (req, res) => {
    const lenders = await lenderController.getAll(req.query)
    if (lenders instanceof ServerError) { return res.status(lenders.errorCode).json(lenders.message) }

    return res.status(200).json(lenders)
  }
)

router.get('/balance/:id?', [auth, validateObjectId], async (req, res) => {
  const lender =
        req.params.id !== undefined ? req.params.id : req.user.lender

  const balance = await lenderController.getBalance(lender)
  if (balance instanceof ServerError) { return res.status(balance.errorCode).json(balance.message) }

  return res.status(200).json(balance)
})

router.get('/forms/:shortUrl', async (req, res) => {
  const response = await lenderController.getPublicFormData(
    req.params.shortUrl
  )
  return res.status(response.code).json(response.payload)
})

router.get(
  '/otp/:tenantId?',
  [auth, verifyRole(master, owner), validateObjectId],
  async (req, res) => {
    console.log('here otp')
    const tenantId =
            req.params.id !== undefined ? req.params.tenantId : req.user.tenantId

    const response = await lenderController.requestOtp(tenantId)
    // if (response instanceof ServerError)
    //     return res.status(response.errorCode).json(response.message);

    return res.status(200).json(response)
  }
)

router.get(
  '/public-url/:id?',
  [auth, verifyRole(master, owner), validateObjectId],
  async (req, res) => {
    const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const publicUrl = await lenderController.genPublicUrl(lender)
    if (publicUrl instanceof ServerError) { return res.status(publicUrl.errorCode).json(publicUrl.message) }

    return res.status(200).json(publicUrl)
  }
)

router.get(
  '/reactivate/:id?',
  [auth, verifyRole(master), validateObjectId],
  async (req, res) => {
    const response = await lenderController.reactivate(req.params.id)
    if (response instanceof ServerError) { return res.status(response.errorCode).json(response.message) }

    return res.status(200).json(response)
  }
)

router.get(
  '/:id',
  [auth, verifyRole(master, owner), validateObjectId],
  async (req, res) => {
    const id =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const lender = await lenderController.getOne(id)
    if (lender instanceof ServerError) { return res.status(lender.errorCode).json(lender.message) }

    return res.status(200).json(lender)
  }
)

router.patch(
  '/settings/:id?',
  [auth, verifyRole(owner, master, admin), validateObjectId],
  async (req, res) => {
    const id =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const { error } = validateUpdateTenantSettings(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const lender = await lenderController.updateSettings(id, req.body)
    if (lender instanceof ServerError) { return res.status(lender.errorCode).json(lender.message) }

    return res.status(200).json(lender)
  }
)

router.patch(
  '/:id?',
  [auth, verifyRole(master, owner), validateObjectId],
  async (req, res) => {
    const id =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const { error } = validateUpdateTenant(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const lender = await lenderController.update(id, req.body)
    if (lender instanceof ServerError) { return res.status(lender.errorCode).json(lender.message) }

    return res.status(200).json(lender)
  }
)

router.post(
  '/fund/:id?',
  [auth, verifyRole(owner), validateObjectId],
  async (req, res) => {
    const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const { error } = fundAccount(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const response = await lenderController.fundWallet(
      lender,
      req.body.amount
    )
    if (response instanceof ServerError) { return res.status(response.errorCode).json(response.message) }

    return res.status(200).json(response)
  }
)

router.post(
  'deactivate/:id?',
  [auth, verifyRole(owner, master), validateObjectId],
  async (req, res) => {
    const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender

    const response = await lenderController.deactivate(
      lender,
      req.user,
      req.body.password
    )
    if (response instanceof ServerError) { return res.status(response.errorCode).json(response.message) }

    return res.status(200).json(response)
  }
)

router.post('/upload/logo', [upload.single('logo')], (req, res) => {
  console.log(req.file)
  return res.json({
    message: 'file uploaded'
  })
})

export default router
