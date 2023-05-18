import { Router } from 'express';
import authWebhook from '../middleware/authWebhook.js';
import WebhookController from '../controllers/webhook.controller.js';

const router = Router();

router.post('/psk', [authWebhook], WebhookController.handleEvent);

export default router;
