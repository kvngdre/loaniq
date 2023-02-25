import { generate } from 'shortid'
import Lender from '../models/tenant.model'
const debug = require('debug')('app:generateShortId')
const logger = require('./Logger')

async function generateShortUrl () {
  try {
    const shortUrl = generate().substring(1, 8)
    const foundShortUrl = await Lender.findOne({ public_url: shortUrl })
    if (foundShortUrl) {
      generateShortUrl()
    } else {
      return shortUrl
    }
  } catch (exception) {
    logger.error({
      method: 'generate_short_url',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return exception
  }
}

export default generateShortUrl
