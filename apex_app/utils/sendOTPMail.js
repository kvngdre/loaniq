require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Importing dotenv
const {
    clientID,
    clientSecret,
    refreshToken,
    senderEmailAddress,
    oauthPlayground
} = process.env

// Setting up oauth2Client
const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    refreshToken,
    oauthPlayground
);
oauth2Client.setCredentials({ refreshToken })

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
                user: senderEmailAddress,
                clientId: clientID,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken
            }
        });
        return transporter;

    }catch(exception) {
        return exception;
    };
}


/**
 * Sends OTP to user email
 * @param {string} userEmailAddress 
 * @param {string} firstName 
 * @param {number} generatedOTP 
 * @returns {Promise}
 */
const sendOTP = async function(userEmailAddress, firstName, generatedOTP) {
    const transporter = await getTransporter();

    // Defining the mailing options
    const mailOptions = {
        from: senderEmailAddress,
        to: userEmailAddress,
        subject: "Apex Email Verification",
        html: 
        `<div style="max-width: 700px; margin:auto; border: 10px solid #dd; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Apex Email Verification.</h2>
        <p> Hi ${firstName || "User"},
        </p>
        <p>Congratulations! You're almost set. Your verification code is <b>${generatedOTP}</b>.
        </p>
        <p>If you have any questions, send an email to ${senderEmailAddress} and our team will provide technical support.:</p>

        <div>Regards <br>
        Apex Team</div>
        </div>
        `
    }; 

    // Sending mail with transporter object
    try{
        await transporter.sendMail(mailOptions);
    }catch(exception) {
        return exception;
    };
};


module.exports = sendOTP;
