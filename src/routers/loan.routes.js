import _ from 'lodash'
import { userRoles } from '../utils/constants'
import { create } from '../validators/customer.validator'
import { create as _create, getAll, getDisbursement, getOne, update, delete_ } from '../controllers/loanController'
import Router from 'express'
import ServerError from '../errors/serverError'
import verifyRole from '../middleware/verifyRole'
import auth from '../middleware/auth'
import validateObjectId from '../middleware/validateId'

const router = Router()

router.post('/', [auth], async (req, res) => {
  const { value, error } = create(
    req.user,
    req.body.customer
  )
  if (error) {
    const errorResponse = error.details[0].context.message
    return res.status(400).json(errorResponse)
  }

  const newLoan = await _create(req.user, value, req.body.loan)
  if (newLoan instanceof ServerError) { return res.status(newLoan.errorCode).json(newLoan.message) }

  return res.status(200).json(newLoan)
})

/**
 * @queryParam status Filter by loan status.
 * @queryParam minA Filter by loan amount. Min value.
 * @queryParam maxA Filter by loan amount. Max value.
 * @queryParam minT Filter by loan tenor. Min value.
 * @queryParam maxT Filter by loan tenor. Max value.
 * @queryParam start Filter by date the loan was created. start date.
 * @queryParam end Filter by date the loan was created. end date.
 * @queryParam sort Sort order. Defaults to 'first name'. [asc, desc, first, last]
 */
router.get('/', [auth], async (req, res) => {
  const loans = await getAll(req.user, req.query)
  if (loans instanceof ServerError) { return res.status(loans.errorCode).json(loans.message) }

  return res.status(200).json(loans)
})

router.get(
  '/disburse',
  [
    auth
  ],
  async (req, res) => {
    const loans = await getDisbursement(req.user, req.query)
    if (loans instanceof ServerError) { return res.status(loans.errorCode).json(loans.message) }

    return res.status(200).json(loans)
  }
)

router.get('/:id', [auth, validateObjectId], async (req, res) => {
  // TODO: add all
  const loan = await getOne(req.params.id)
  if (loan instanceof ServerError) { return res.status(loan.errorCode).json(loan.message) }

  return res.status(200).json(loan)
})

router.patch('/:id', [auth, validateObjectId], async (req, res) => {
  const loan = await update(req.params.id, req.user, req.body)
  if (loan instanceof ServerError) { return res.status(loan.errorCode).json(loan.message) }

  return res.status(200).json(loan)
})

router.delete(
  '/:id', [validateObjectId],
  async (req, res) => {
    const deletedLoan = await delete (req.params.id)
    if (deletedLoan instanceof ServerError) { return res.status(deletedLoan.errorCode).json(deletedLoan.message) }

    return res.status(204).json(deletedLoan)
  }
)

export default router
