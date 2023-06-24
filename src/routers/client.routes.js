import { Router } from 'express';
import ClientController from '../controllers/client.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

router.post('/', verifyJWT, ClientController.createClient);

router.post('/signup', ClientController.signup);

router.post('/verify-signup', ClientController.verifySignup);

router.get('/', ClientController.getClients);

router.get('/:clientId', ClientController.getClient);

export default router;
