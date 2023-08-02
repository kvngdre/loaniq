import Sqrl from "squirrelly";
import { constants } from "../config/index.js";
import EmailTemplateDAO from "../repositories/email-template.dao.js";
import getMailTransport from "../utils/getMailTransport.js";
import logger from "../utils/logger.js";

class EmailService {
  static async sendTest() {}

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
}

export default EmailService;
