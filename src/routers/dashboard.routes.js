import { Router } from 'express'
import { getLoanData } from '../controllers/dashboardController'
import ServerError from '../errors/serverError'
import verifyJWT from '../middleware/verifyJWT'

const router = Router()

router.get('/charts', verifyJWT, async (req, res) => {
  const data = await getLoanData(req.user)
  if (data instanceof ServerError) return res.status(data.errorCode).json(data.message)

  return res.status(200).json(data)
})

export default router
