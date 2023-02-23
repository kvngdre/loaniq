import { roles } from '../utils/constants'
import auth from '../middleware/verifyToken'
import customerController from '../controllers/customer.controller'
import Router from 'express'
import ServerError from '../errors/serverError'
import upload from '../middleware/fileUpload'
import validateObjectId from '../middleware/validateObjectId'
import verifyRole from '../middleware/verifyRole'

const router = Router()

const { admin, agent, master, operations, owner } = roles

router.post(
  '/new',
  [auth, verifyRole(agent, owner, operations, master), validateObjectId],
  async (req, res) => {
    const response = await customerController.create(req.user, req.body)
    return res.status(response.code).json(response.payload)
  }
)

router.post(
  '/upload-docs',
  [upload.fields([{ name: 'passport' }, { name: 'idCard' }])],
  async (req, res) => {
    // FIXME: upload to s3
    console.log(req.files)
    return res.status(200).json('Docs uploaded')
  }
)

/**
 * @queryParam name Filter by name.
 * @queryParam min Filter by net pay. Min value.
 * @queryParam max Filter by net pay. Max value.
 * @queryParam minAge Filter by customer age. Min value.
 * @queryParam maxAge Filter by customer age. Max value.
 * @queryParam segment Filter by customer segment.
 * @queryParam state Filter by customer state of residence.
 * @queryParam field Fields to include. Defaults to all fields.
 */
router.get('/', [auth], async (req, res) => {
  console.log(req.query)
  const response = await customerController.getCustomers(req.user, req.query)
  return res.status(response.code).json(response.payload)
})

router.get('/:customerId', [auth, validateObjectId], async (req, res) => {
  const response = await customerController.getCustomers(
    req.params.customerId
  )
  return res.status(response.code).json(response.payload)
})

router.patch('/:customerId', [auth, validateObjectId], async (req, res) => {
  const response = await customerController.updateCustomer(
    req.params.customerId,
    req.user,
    req.body
  )
  return res.status(response.code).json(response.payload)
})

router.delete(
  '/:customerId',
  [auth, verifyRole(admin, owner, operations, master), validateObjectId],
  async (req, res) => {
    const response = await customerController.delete(req.params.customerId)
  }
)

export default router
