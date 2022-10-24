const { google } = require('googleapis');
const config = require('config');
const debug = require('debug')('app:mailer');
const hbs = require('nodemailer-express-handlebars');
const logger = require('../utils/logger')('mailer.js');
const nodemailer = require('nodemailer');
const path = require('path');
const partialsPath = path.resolve(__dirname, '../assets/templates/partials/');
const viewsPath = path.resolve(__dirname, '../assets/templates/views/');

// TODO: clean up sendMail with domain name for sending mails
const {
    client_id,
    client_secret,
    refresh_token,
    sender_email,
    oauth_playground,
} = config.get('mail');

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    refresh_token,
    oauth_playground
);

oauth2Client.setCredentials({ refresh_token });

// Creating reusable transport object
async function getTransporter() {
    try {
        const accessToken = await oauth2Client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: sender_email,
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
                accessToken,
            },
        });

        return transporter;
    } catch (exception) {
        logger.error({
            method: 'get_mail_transport',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return exception;
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
    payload: { otp, password },
}) {
    const transporter = await getTransporter();
    transporter.use('compile', hbs({
        viewEngine: {
            extname: '.hbs',
            layoutsDir: viewsPath,
            partialsDir: partialsPath,
            defaultLayout: false,
        },
        viewPath: viewsPath,
        extName: '.hbs'
    }));

    // Defining the mailing options
    const mailOptions = {
        from: `"Apexxia" <${sender_email}>`,
        to: to,
        subject: subject,
        template: template,
        context: {
            name: name,
            OTP: otp,
            pwd: password,
        },
        attachments: [],
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
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (exception) {
        logger.error({
            method: 'sendMail',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return exception;
    }
};

module.exports = sendMail;
