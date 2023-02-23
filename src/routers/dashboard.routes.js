import Router from 'express'
import { getLoanData } from '../controllers/dashboardController'
import ServerError from '../errors/serverError'
import verifyToken from '../middleware/verifyToken'

const router = Router()

router.get('/charts', verifyToken, async (req, res) => {
  const data = await getLoanData(req.user)
  if (data instanceof ServerError) return res.status(data.errorCode).json(data.message)

  return res.status(200).json(data)
})

export default router
