import { roles } from '../utils/constants'
import Router from 'express'
import ServerError from '../errors/serverError'
import { create, getAll, getOne, update, delete_ } from '../controllers/stateController'
import { create as _create, update as _update } from '../validators/stateValidator'
import verifyRole from '../middleware/verifyRole'
import verifyToken from '../middleware/verifyToken'

const router = Router()

router.post('/', verifyToken, verifyRole(roles.master), async (req, res) => {
  const { error } = _create(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const newState = await create(req.body)
  if (newState instanceof ServerError) {
    return res.status(newState.errorCode).json(newState.message)
  }

  return res.status(201).json(newState)
})

router.get('/', async (req, res) => {
  const states = await getAll(req.query)
  if (states instanceof ServerError) { return res.status(states.errorCode).json(states.message) }

  return res.status(200).json(states)
})

router.get('/:id', verifyToken, async (req, res) => {
  const state = await getOne(req.params.id)
  if (state instanceof ServerError) { return res.status(state.errorCode).json(state.message) }

  return res.status(200).json(state)
})

router.patch(
  '/:id',
  verifyToken,
  verifyRole(roles.master),
  async (req, res) => {
    const { error } = _update(req.body)
    if (error) return res.status(400).json(error.details[0].message)

    const state = await update(req.params.id, req.body)
    if (state instanceof ServerError) { return res.status(state.errorCode).json(state.message) }

    return res.status(200).json(state)
  }
)

router.delete(
  '/:id',
  verifyToken,
  verifyRole(roles.master),
  async (req, res) => {
    const state = await delete (req.params.id)
    if (state instanceof ServerError) { return res.status(state.errorCode).json(state.message) }

    return res.status(204).json(state)
  }
)

export default router
