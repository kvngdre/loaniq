import { Router } from 'express'
import authWebhook from '../middleware/authWebhook'
import WebhookController from '../controllers/webhook.controller'

const router = Router()

router.post('/psk', [authWebhook], WebhookController.handleEvent)

export default router
