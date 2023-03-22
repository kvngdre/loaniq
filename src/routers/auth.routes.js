import AuthController from '../controllers/auth.controller'
import { Router } from 'express'
import auth from '../middleware/auth'

const router = Router()

router.post('/verify_registration', AuthController.verifyRegistration)

router.post('/login', AuthController.login)

router.post('/callback', AuthController.callback)

router.get('/logout', AuthController.logout)

router.get('/sessions/logout', [auth], AuthController.logoutAllSessions)

router.get('/me', [auth], AuthController.getCurrentUser)

router.get('/request_otp', AuthController.sendOTP)

router.get('/token_set', AuthController.getNewTokenSet)

export default router
