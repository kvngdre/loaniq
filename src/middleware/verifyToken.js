import { get } from '../config'
import { verify } from 'jsonwebtoken'
const debug = require('debug')('app:verifyToken')

function verifyToken (req, res, next) {
  try {
    const authHeader =
            req.header('authorization') || req.header('Authorization')
    if (!authHeader) return res.status(401).json('No authorization header')

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer') return res.jsonStatus(401)
    if (!token) { return res.status(401).json('Access Denied. No token provided.') }

    const decoded = verify(token, get('jwt.secret.access'))
    if (
      decoded.iss !== get('jwt.issuer') ||
            decoded.aud !== get('jwt.audience')
    ) {
      return res.status(401).json('Invalid token provided.')
    }
    req.user = decoded

    next()
  } catch (exception) {
    debug(exception)
    if (exception.name === 'TokenExpiredError') { return res.status(403).json('Session expired.') }

    return res.jsonStatus(403)
  }
}

export default verifyToken
