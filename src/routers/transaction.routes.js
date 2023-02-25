import { userRoles } from '../utils/constants'
import Router from 'express'
import ServerError from '../errors/serverError'
import { create, getAll, getOne, update } from '../controllers/transactionController'
import { create as _create, update as _update } from '../validators/transactionValidator'
import verifyRole from '../middleware/verifyRole'
import verifyToken from '../middleware/verifyToken'

const router = Router()

router.post('/', verifyToken, async (req, res) => {
  const { error } = _create(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const newTransaction = await create(req.user, req.body)
  if (newTransaction instanceof ServerError) {
    return res
      .status(newTransaction.errorCode)
      .json(newTransaction.message)
  }

  return res.status(201).json(newTransaction)
})

/**
 * @queryParam status Filter by transaction status.
 * @queryParam min Filter by transaction amount. Min value.
 * @queryParam max Filter by transaction amount. Max value.
 * @queryParam type Filter by transaction type.
 * @queryParam lender Filter by lender.
 */
router.get(
  '/',
  verifyToken,
  async (req, res) => {
    const transactions = await getAll(req.user, req.query)
    if (transactions instanceof ServerError) {
      return res
        .status(transactions.errorCode)
        .json(transactions.message)
    }

    return res.status(200).json(transactions)
  }
)

router.get(
  '/:id',
  verifyToken,
  async (req, res) => {
    const transaction = await getOne(req.params.id, req.user)
    if (transaction instanceof ServerError) { return res.status(transaction.errorCode).json(transaction.message) }

    return res.status(200).json(transaction)
  }
)

router.patch(
  '/:id',
  verifyToken,
  async (req, res) => {
    const { error } = _update(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const transaction = await update(
      req.params.id,
      req.user,
      req.body
    )
    if (transaction instanceof ServerError) { return res.status(transaction.errorCode).json(transaction.message) }

    return res.status(200).json(transaction)
  }
)

export default router
