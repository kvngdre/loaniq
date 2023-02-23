import { roles } from '../utils/constants'
import Router from 'express'
import verifyRole from '../middleware/verifyRole'
import verifyToken from '../middleware/verifyToken'
import { create, update } from '../validators/segmentValidator'
import { create as _create, getAll, get, update as _update, delete_ } from '../controllers/segmentController'
import ServerError from '../errors/serverError'

const router = Router()

router.post('/', verifyToken, verifyRole(roles.master), async (req, res) => {
  const { error } = create(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const newSegment = await _create(req.body)
  if (newSegment instanceof ServerError) { return res.status(newSegment.errorCode).json(newSegment.message) }

  return res.status(201).json(newSegment)
})

router.get('/', verifyToken, async (req, res) => {
  const segments = await getAll(req.query)
  if (segments instanceof ServerError) { return res.status(segments.errorCode).json(segments.message) }

  return res.status(200).json(segments)
})

router.get('/:id', verifyToken, async (req, res) => {
  const segment = await get(req.params.id)
  if (segment instanceof ServerError) { return res.status(segment.errorCode).json(segment.message) }

  return res.status(200).json(segment)
})

router.patch(
  '/:id',
  verifyToken,
  verifyRole(roles.master),
  async (req, res) => {
    const { error } = update(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const segment = await _update(req.params.id, req.body)
    if (segment instanceof ServerError) { return res.status(segment.errorCode).json(segment.message) }

    return res.status(200).json(segment)
  }
)

router.delete(
  '/:id',
  verifyToken,
  verifyRole(roles.master),
  async (req, res) => {
    const segment = await delete (req.params.id)
    if (segment instanceof ServerError) { return res.status(segment.errorCode).json(segment.message) }

    return res.status(204).json(segment)
  }
)

export default router
