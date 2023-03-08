import { Router } from 'express'
import verifyRole from '../middleware/verifyRole'
import verifyToken from '../middleware/verifyToken'
import { create, update } from '../validators/originValidator'
import { create as _create, getAll, getOne, update as _update, delete_ } from '../controllers/originController'

const router = Router()

router.post('/', verifyToken, async (req, res) => {
  const { error } = create(req.body)
  if (error) {
    const errorResponse = error.details
    return res.status(400).json(errorResponse)
  }

  const staff = await _create(req.body)
  if (staff.hasOwnProperty('errorCode')) { return res.status(staff.errorCode).json(staff.message) }

  return res.status(201).json(staff)
})

// Get all staff
router.post('/all', verifyToken, async (req, res) => {
  const staff = await getAll(req.body)
  if (staff.hasOwnProperty('errorCode')) { return res.status(staff.errorCode).json(staff.message) }

  return res.status(200).json(staff)
})

router.get('/:id', verifyToken, async (req, res) => {
  const staff = await getOne(req.params.id)
  if (staff.hasOwnProperty('errorCode')) { return res.status(staff.errorCode).json(staff.message) }

  return res.status(200).json(staff)
})

router.patch('/:id', verifyToken, async (req, res) => {
  const { error } = update(req.body)
  if (error) return res.status(400).json(error.details[0].message)

  const staff = await _update(req.params.id, req.body)
  if (staff.hasOwnProperty('errorCode')) { return res.status(staff.errorCode).json(staff.message) }

  return res.status(200).json(staff)
})

router.delete('/:id', verifyToken, async (req, res) => {
  const staff = await delete (req.params.id)
  if (staff.hasOwnProperty('errorCode')) { return res.status(404).json(staff.message) }

  return res.status(204).json(staff)
})

export default router
