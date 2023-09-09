import { google } from "googleapis";
import { createTransport } from "nodemailer";
import Sqrl from "squirrelly";

import { config } from "../../config/index.js";
import { logger } from "../../utils/index.js";
import { EmailTemplateService } from "./email-template.service.js";

export class MailService {
  static async send({ to, templateName, context }) {
    try {
      const template = await EmailTemplateService.getTemplate({
        name: templateName,
      });

      const transport = await this.#getMailTransporter();

      const subject = Sqrl.render(template.subject, context);
      const html = Sqrl.render(template.body, context);

      const info = await transport.sendMail({
        from: `"AIdea" <${config.mail.sender}>`,
        to,
        subject,
        html,
      });

      return { error: null, info };
    } catch (error) {
      logger.fatal(error.message, error.stack);
      return { error, info: null };
    }
  }

  static async #getMailTransporter() {
    const options = {
      clientId: config.mail.client_id,
      clientSecret: config.mail.client_secret,
      refreshToken: config.mail.refresh_token,
      oauthPlayground: config.mail.oauth_playground,
    };
    const oauth2Client = new google.auth.OAuth2(options);

    oauth2Client.setCredentials({ refresh_token: config.mail.refresh_token });
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: config.mail.sender,
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        refreshToken: options.refreshToken,
        accessToken,
      },
    });

    return transporter;
  }
}
