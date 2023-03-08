import { create, getAll, getOne, update, delete_ } from '../controllers/review.controller.js'
import { create as _create, update as _update } from '../validators/pendingEditValidator'
import { Router } from 'express'
import ServerError from '../errors/serverError'
import grantAccess from '../middleware/grantAccess'
import auth from '../middleware/auth'

const router = Router()

router.post('/', auth, async (req, res) => {
  const { error } = _create(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const newEditRequest = await create(
    req.user,
    req.body
  )
  if (newEditRequest instanceof ServerError) {
    return res
      .status(newEditRequest.errorCode)
      .json(newEditRequest.message)
  }

  return res.status(201).json(newEditRequest)
})

router.get('/', auth, async (req, res) => {
  const editRequests = await getAll(req.user)
  if (editRequests instanceof ServerError) { return res.status(editRequests.errorCode).json(editRequests.message) }

  return res.status(200).json(editRequests)
})

router.get('/:id', auth, async (req, res) => {
  const editRequest = await getOne(
    req.params.id,
    req.user
  )
  if (editRequest instanceof ServerError) { return res.status(editRequest.errorCode).json(editRequest.message) }

  return res.status(200).json(editRequest)
})

router.patch('/:id', auth, async (req, res) => {
  const { error } = _update(req.user, req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const editRequest = await update(
    req.params.id,
    req.user,
    req.body
  )
  if (editRequest instanceof ServerError) { return res.status(editRequest.errorCode).json(editRequest.message) }

  return res.status(200).json(editRequest)
})

router.delete('/:id', auth, async (req, res) => {
  const editRequest = await delete (
    req.params.id,
    req.user
  )
  if (editRequest instanceof ServerError) { return res.status(editRequest.errorCode).json(editRequest.message) }

  return res.status(204).json(editRequest)
})

export default router
