import EmailTemplateDAO from "../data/repositories/email-template.dao.js";
import { NotFoundError } from "../utils/errors/index.js";

export class EmailTemplateService {
  static async create(newEmailTemplateDTO) {
    return EmailTemplateDAO.insert(newEmailTemplateDTO);
  }

  static async getAll(filter = {}) {
    return EmailTemplateDAO.find(filter);
  }

  static async getById(id) {
    const foundTemplate = await EmailTemplateDAO.findById(id);
    if (!foundTemplate) {
      throw new NotFoundError("Email template not found");
    }

    return foundTemplate;
  }

  static async getTemplate(filter) {
    const foundTemplate = await EmailTemplateDAO.findOne(filter);
    if (!foundTemplate) {
      throw new NotFoundError("Email template not found");
    }

    return foundTemplate;
  }

  static async update(id, updateTemplateDTO) {
    return EmailTemplateDAO.update(id, updateTemplateDTO);
  }

  static async delete(id) {
    return EmailTemplateDAO.remove(id);
  }
}
