import { google } from "googleapis";
import { createTransport } from "nodemailer";
import Sqrl from "squirrelly";

import EmailTemplateDAO from "../data/repositories/email-template.dao.js";
import getMailTransport from "../utils/getMailTransport.js";
import { logger } from "../utils/index.js";

export class EmailService {
  #transport;

  constructor() {
    this.#transport = this.#getMailTransporter();
  }

  // static async sendTest() {}

  static async addTemplate(newEmailTemplateDTO) {
    const newTemplate = await EmailTemplateDAO.insert(newEmailTemplateDTO);

    return newTemplate;
  }

  static async getTemplates(filter) {
    const foundTemplates = await EmailTemplateDAO.find(filter);
    const count = Intl.NumberFormat("en-US").format(foundTemplates.length);

    return { count, foundTemplates };
  }

  static async getTemplateById(templateId) {
    const foundTemplate = await EmailTemplateDAO.findById(templateId);

    return foundTemplate;
  }

  static async getTemplate(filter) {
    const foundTemplate = await EmailTemplateDAO.findOne(filter);

    return foundTemplate;
  }

  static async updateTemplate(templateId, updateTemplateDTO) {
    const updatedTemplate = await EmailTemplateDAO.update(
      templateId,
      updateTemplateDTO,
    );

    return updatedTemplate;
  }

  static async deleteTemplate(templateId) {
    const deletedTemplate = await EmailTemplateDAO.remove(templateId);

    return deletedTemplate;
  }

  static async send({ from, to, templateName, context = {} }) {
    try {
      const { senderEmail } = constants.mailer;
      const template = await EmailService.getTemplate({ templateName });
      const transporter = await getMailTransport();

      template.subject = Sqrl.render(template.subject, context);
      template.html = Sqrl.render(template.html, context);

      const info = await transporter.sendMail({
        from: `"Aidea" <${from || senderEmail}>`,
        to,
        subject: template.subject,
        html: template.html,
      });

      info.error = false;
      return info;
    } catch (error) {
      logger.fatal(error.message, error.stack);
      return { error: true, reason: error.message };
    }
  }

  async #getMailTransporter() {
    // try {
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
    // } catch (exception) {
    //   logger.fatal(exception.message, exception.stack);
    //   throw new Error("Error creating mail transport.");
    // }
  }
}
