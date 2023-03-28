import { Router } from 'express'
import AuthController from '../controllers/auth.controller'
import verifyJWT from '../middleware/verifyJWT'

const router = Router()

router.post('/login', AuthController.login)

router.post('/callback', AuthController.callback)

router.get('/logout', AuthController.logout)

router.get('/sessions/logout', [verifyJWT], AuthController.signOutAllSessions)

router.get('/request_otp', AuthController.sendOTP)

router.get('/tokens', AuthController.getNewTokens)

export default router
