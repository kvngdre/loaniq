import ClientController from '../controllers/client.controller.js'
import { Router } from 'express'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.post('/', verifyJWT, ClientController.createClient)

router.post('/signup', ClientController.signup)

router.get('/', ClientController.getClient)

router.get('/:clientId', ClientController.getClient)

export default router
