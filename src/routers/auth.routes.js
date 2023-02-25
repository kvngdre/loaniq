import AuthController from '../controllers/auth.controller'
import Router from 'express'

const router = Router()

router.post('/verify_registration', AuthController.verifyRegistration)

router.post('/login', AuthController.login)

router.get('/logout', AuthController.logout)

router.get('/request_otp', AuthController.sendOTP)

router.get('/token_set', AuthController.getNewTokenSet)

export default router
