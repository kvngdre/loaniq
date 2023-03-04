import WebhookService from '../services/webhook.service'

class WebhookController {
  static async handleEvent (req, res) {
    const code = await WebhookService.eventHandler(req.body)

    res.sendStatus(code)
  }
}

export default WebhookController
