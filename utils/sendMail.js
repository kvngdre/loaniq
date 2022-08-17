const config = require('config');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const debug = require('debug')('app:mailer');

// TODO: clean up sendMail with domain name for sending mails

const {
    client_id,
    client_secret,
    refresh_token,
    sender_email,
    oauth_playground
} = config.get('mail');

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    refresh_token,
    oauth_playground
);

oauth2Client.setCredentials({ refresh_token });

/**
 * Create a nodeMail transporter
 * @returns transporter
 */
async function getTransporter() {
    try{
        // Creating reusable transport object
        const accessToken = await oauth2Client.getAccessToken();
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: sender_email,
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
                accessToken
            }
        });

        return transporter;

    }catch(exception) {
        debug(exception);
        return exception;
    };
}

/**
 * Sends OTP to user email
 * @param {string} userEmailAddress
 * @param {string} name 
 * @param {number} generatedOTP 
 * @returns {Promise}
 */
const sendMail = async function(userEmailAddress, name, generatedOTP, tempPassword='') {
    const transporter = await getTransporter();

    // Defining the mailing options
    const mailOptions = {
        from: sender_email,
        to: userEmailAddress,
        subject: "User Verification",
        html: 
        `<div style="max-width: 700px; margin:auto; border: 10px solid #dd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Apex Email Verification.</h2>
        <p> Hi ${name},
        </p>
        <p>Congratulations! You're almost set. Enter the sign up OTP to get started.
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${generatedOTP}<br>${tempPassword}</b></h1>
        </p>
        <p>If you have any questions, send an email to ${sender_email} and our team will provide technical support.:</p>

        <div>Regards, <br>
        Apexxia Team</div>
        </div>
        `
    }; 

    try{
        await transporter.sendMail(mailOptions);

    }catch(exception) {
        debug(exception);
        return exception;
    };
};

module.exports = sendMail;