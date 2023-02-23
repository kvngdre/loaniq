import Router from 'express'
import { getBanks } from '../utils/Flutterwave'
import webhooks from '../controllers/webhook.controller'

const router = Router()

router.post('/paystack', async (req, res) => {
  if (!req.headers['x-paystack-signature']) return res.jsonStatus(401)

  const response = await webhooks.paystack(req.headers['x-paystack-signature'], req.body)
  return res.sendStatus(response)
})

router.post('/flutterwave', async (req, res) => {
  if (!req.headers['verif-hash']) return res.jsonStatus(401)

  const response = await webhooks.flutterwave(req.headers['verif-hash'], req.body)
  return res.sendStatus(response)
})

router.get('/flutterwave/banks', async (req, res) => {
  const response = await getBanks()
  return res.status(200).json(response)
})

export default router
