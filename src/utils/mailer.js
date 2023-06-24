import { createTransport } from 'nodemailer';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import path from 'path';
import hbs from 'nodemailer-express-handlebars';
import DependencyError from '../errors/DependencyError.js';
import { constants } from '../config/index.js';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partialsPath = path.resolve(__dirname, '../assets/templates/partials/');
const viewsPath = path.resolve(__dirname, '../assets/templates/views/');

// todo Clean up sendMail with domain name for sending mails
const { clientId, clientSecret, refreshToken, senderEmail, oauthPlayground } =
  constants.mailer;

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  refreshToken,
  oauthPlayground,
);

oauth2Client.setCredentials({ refresh_token: refreshToken });

// Creating reusable transport object
async function getTransporter() {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
    });

    return transporter;
  } catch (exception) {
    logger.error(exception.message, exception.stack);
    throw new DependencyError('Error sending OTP, try again later.');
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
  from,
  to,
  subject,
  template,
  name = undefined,
  payload,
}) {
  // Defining the mailing options
  const mailOptions = {
    from: `"Aidea" <${from || senderEmail}>`,
    to,
    subject,
    template,
    context: {
      name,
      OTP: payload?.otp || '',
      pwd: payload?.password || '',
    },
    attachments: [],
  };

  const transporter = await getTransporter();

  // Setting transport template engine.
  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        extname: '.hbs',
        layoutsDir: viewsPath,
        partialsDir: partialsPath,
        defaultLayout: false,
      },
      viewPath: viewsPath,
      extName: '.hbs',
    }),
  );

  try {
    // ! Sending email...
    return await transporter.sendMail(mailOptions);
  } catch (exception) {
    logger.fatal(`Mailer: ${exception.message}`, exception.stack);
    throw new DependencyError('Error sending mail, try again later.');
  }
};

export default sendMail;
