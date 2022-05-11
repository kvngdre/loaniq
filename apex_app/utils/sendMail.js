require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const debug = require('debug')('sendMail');

// TODO: clean up sendMail with domain name for sending mails

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    SENDER_EMAIL_ADDRESS,
    OAUTH_PLAYGROUND
} = process.env

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    OAUTH_PLAYGROUND
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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
                user: SENDER_EMAIL_ADDRESS,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
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
        from: SENDER_EMAIL_ADDRESS,
        to: userEmailAddress,
        subject: "Apex Email Verification",
        html: 
        `<div style="max-width: 700px; margin:auto; border: 10px solid #dd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Apex Email Verification.</h2>
        <p> Hi ${name},
        </p>
        <p>Congratulations! You're almost set. Enter the sign up OTP to get started.
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${generatedOTP}<br>${tempPassword}</b></h1>
        </p>
        <p>If you have any questions, send an email to ${SENDER_EMAIL_ADDRESS} and our team will provide technical support.:</p>

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
