import { createHmac } from 'crypto';
import config from '../config/index.js';
import UnauthorizedError from '../errors/unauthorized.error.js';

export default function authWebhook(req, res, next) {
  function getSignatureFromHeader(req) {
    if (!req.headers['x-paystack-signature']) {
      throw new UnauthorizedError('No signature.');
    }

    return req.headers['x-paystack-signature'];
  }

  const signature = getSignatureFromHeader(req);
  const hash = createHmac('sha512', config.paystack.key.private)
    .update(JSON.stringify(req.body))
    .digest('hex');

  console.log(hash);

  if (hash !== signature) {
    throw new UnauthorizedError('Invalid signature.');
  }

  next();
}
