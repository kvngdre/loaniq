import { constants } from '../config/index.js'
import { google } from 'googleapis'
import { createTransport } from 'nodemailer'
import logger from './logger.js'

const { clientId, clientSecret, refreshToken, oauthPlayground, senderEmail } = constants.mailer

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  refreshToken,
  oauthPlayground
)

oauth2Client.setCredentials({ refresh_token: refreshToken })

// Creating reusable transport object
export default async function getMailTransport () {
  try {
    const accessToken = await oauth2Client.getAccessToken()
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId,
        clientSecret,
        refreshToken,
        accessToken
      }
    })

    return transporter
  } catch (exception) {
    logger.fatal(exception.message, exception.stack)
    throw new Error('Error creating mail transport.')
  }
}
