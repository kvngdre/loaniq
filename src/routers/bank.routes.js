import { userRoles } from '../utils/constants'
import bankController from '../controllers/bank.controller'
import Router from 'express'
import validateObjectId from '../middleware/validateObjectId'
import verifyRole from '../middleware/verifyRole'
import auth from '../middleware/verifyToken'

const router = Router()

const { ADMIN, MASTER, OWNER } = userRoles

router.post('/', [auth, verifyRole(ADMIN, OWNER, MASTER)], async (req, res) => {
  const response = await bankController.create(req.body)
  return res.status(response.code).json(response.payload)
})

router.get('/', async (req, res) => {
  const response = await bankController.getBanks()
  return res.status(response.code).json(response.payload)
})

router.get('/:bankId', [auth, validateObjectId], async (req, res) => {
  const response = await bankController.getBank(req.params.bankId)
  return res.status(response.code).json(response.payload)
})

router.patch(
  '/:bankId',
  [auth, verifyRole(ADMIN, MASTER, OWNER), validateObjectId],
  async (req, res) => {
    const response = await bankController.updateBank(
      req.params.bankId,
      req.body
    )
    return res.status(response.code).json(response.payload)
  }
)

router.delete(
  '/:bankId',
  [auth, validateObjectId],
  async (req, res) => {
    const response = await bankController.deleteBank(req.params.bankId)
    return res.status(response.code).json(response.payload)
  }
)

export default router
