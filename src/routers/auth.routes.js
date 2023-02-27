import AuthController from '../controllers/auth.controller'
import Router from 'express'
import auth from '../middleware/auth'

const router = Router()

router.post('/verify_registration', AuthController.verifyRegistration)

router.post('/login', AuthController.login)

router.get('/logout', AuthController.logout)

// todo improve the route name
router.get('/logout_all', [auth], AuthController.logoutAllSessions)

router.get('/me', [auth], AuthController.getLoggedInUser)

router.get('/request_otp', AuthController.sendOTP)

router.get('/token_set', AuthController.getNewTokenSet)

export default router
