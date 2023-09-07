import { Router } from "express";
import WebhookController from "../controllers/webhook.controller.js";
import authWebhook from "../middleware/authWebhook.js";

const router = Router();

router.post("/psk", [authWebhook], WebhookController.handleEvent);

export default router;
