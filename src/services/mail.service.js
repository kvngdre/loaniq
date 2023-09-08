import { google } from "googleapis";
import { createTransport } from "nodemailer";
import Sqrl from "squirrelly";

import { EmailTemplateService } from "./email-template.service.js";

export class MailService {
  // static async sendTest() {}

  static async send({ to, templateName, context = {} }) {
    try {
      const template = await EmailTemplateService.getTemplate({
        name: templateName,
      });
      const transport = await this.#getMailTransporter();

      const subject = Sqrl.render(template.subject, context);
      const body = Sqrl.render(template.body, context);

      const info = await transport.sendMail({
        from: `"AIdea" <${process.env.SENDER_EMAIL}>`,
        to,
        subject,
        html: body,
      });

      return { error: null, info };
    } catch (error) {
      return { error, info: null };
    }
  }

  static async #getMailTransporter() {
    const options = {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      oauthPlayground: process.env.OAUTH_PLAYGROUND,
    };
    const oauth2Client = new google.auth.OAuth2(options);

    oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SENDER_EMAIL,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        refreshToken: options.refreshToken,
        accessToken,
      },
    });

    return transporter;
  }
}
