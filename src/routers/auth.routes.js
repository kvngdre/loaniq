import authController from '../controllers/auth.controller'
import Router from 'express'
import refreshTokenController from '../controllers/refreshToken.controller'

const router = Router()

router.post('/login', async (req, res) => {
  const response = await authController.login(
    req.body,
    req.cookies,
    res
  )
  return res.status(response.code).json(response.payload)
})

router.get('/logout', async (req, res) => {
  const response = await authController.logout(req.cookies, res)
  return res.status(response.code).json(response.payload)
})

router.get('/refresh-token', async (req, res) => {
  const response = await refreshTokenController.handleRefreshToken(
    req.cookies,
    res
  )
  return res.status(response.code).json(response.payload)
})

export default router
