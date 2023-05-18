import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/login', AuthController.login);

router.post('/callback', AuthController.callback);

router.get('/logout', AuthController.logout);

router.get('/sessions/logout', [verifyJWT], AuthController.signOutAllSessions);

router.get('/request-otp', AuthController.sendOTP);

router.get('/tokens', AuthController.getNewTokens);

export default router;
