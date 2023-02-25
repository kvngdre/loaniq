import { google } from 'googleapis'
import { constants } from '../config'
import { createTransport } from 'nodemailer'
import { resolve } from 'path'
import DependencyError from '../errors/DependencyError'
import hbs from 'nodemailer-express-handlebars'
import logger from './Logger'

const partialsPath = resolve(__dirname, '../assets/templates/partials/')
const viewsPath = resolve(__dirname, '../assets/templates/views/')

// TODO: clean up sendMail with domain name for sending mails
const { clientId, clientSecret, refreshToken, senderEmail, oauthPlayground } =
  constants.mailer

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  refreshToken,
  oauthPlayground
)

oauth2Client.setCredentials({ refresh_token: refreshToken })

// Creating reusable transport object
async function getTransporter () {
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
    logger.error(exception.message, exception.stack)
    throw new DependencyError('Error sending OTP, try again later.')
  }
}

/**
 * Sends email to the specified recipient
 * @param {Object} params Information required to send mail.
 * @param {string} params.to The recipients email address.
 * @param {string} params.subject The subject of the email.
 * @param {string} params.template The email template to be used.
 * @param {string} params.name The name of the recipient.
 * @param {Object} [params.payload] Payload to be sent in mail.
 * @param {string} params.payload.otp OTP if to be sent in mail.
 * @param {string} params.payload.password Password if to be sent in mail.
 * @returns {Promise}
 */
const sendMail = async function ({
  to,
  subject,
  template,
  name,
  payload: { otp, password }
}) {
  const transporter = await getTransporter()
  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        extname: '.hbs',
        layoutsDir: viewsPath,
        partialsDir: partialsPath,
        defaultLayout: false
      },
      viewPath: viewsPath,
      extName: '.hbs'
    })
  )

  // Defining the mailing options
  const mailOptions = {
    from: `"Apex" <${senderEmail}>`,
    to,
    subject,
    template,
    context: {
      name,
      OTP: otp,
      pwd: password
    },
    attachments: []
    // html: `<div style="max-width: 700px; margin:auto; border: 10px solid #dd; padding: 50px 20px; font-size: 110%;">
    // <h2 style="text-align: center; text-transform: uppercase;color: teal;">Apex Email Verification.</h2>
    // <p> Hi ${name},
    // </p>
    // <p>Congratulations! You're almost set. Enter the sign up OTP to get started.
    // <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}<br>${pwd}</b></h1>
    // </p>
    // <p>If you have any questions, send an email to ${sender_email} and our team will provide technical support.:</p>

    // <div>Regards, <br>
    // Apexxia Team</div>
    // </div>
    // `,
  }

  try {
    return await transporter.sendMail(mailOptions)
  } catch (exception) {
    logger.error(exception.message, exception.stack)
    throw new DependencyError('Error sending OTP, try again later.')
  }
}

export default sendMail
