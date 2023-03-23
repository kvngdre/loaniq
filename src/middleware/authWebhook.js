import { constants } from '../config/index'
import { createHmac } from 'crypto'
import UnauthorizedError from '../errors/UnauthorizedError'

export default function authWebhook (req, res, next) {
  function getSignatureFromHeader (req) {
    if (!req.headers['x-paystack-signature']) {
      throw new UnauthorizedError('No signature.')
    }

    return req.headers['x-paystack-signature']
  }

  const signature = getSignatureFromHeader(req)
  const hash = createHmac('sha512', constants.paystack.key.private)
    .update(JSON.stringify(req.body))
    .digest('hex')

  console.log(hash)

  if (hash !== signature) {
    throw new UnauthorizedError('Invalid signature.')
  }

  next()
}
