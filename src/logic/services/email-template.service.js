import { EmailTemplateRepository } from "../../data/repositories/index.js";
import { NotFoundError } from "../../utils/errors/index.js";

export class EmailTemplateService {
  static async create(newEmailTemplateDTO) {
    return EmailTemplateRepository.insert(newEmailTemplateDTO);
  }

  static async getAll(filter = {}) {
    return EmailTemplateRepository.find(filter);
  }

  static async getById(id) {
    const foundTemplate = await EmailTemplateRepository.findById(id);
    if (!foundTemplate) {
      throw new NotFoundError("Email template not found");
    }

    return foundTemplate;
  }

  static async getTemplate(filter) {
    const foundTemplate = await EmailTemplateRepository.findOne(filter);
    if (!foundTemplate) {
      throw new NotFoundError("Email template not found");
    }

    return foundTemplate;
  }

  static async update(id, updateTemplateDTO) {
    return EmailTemplateRepository.update(id, updateTemplateDTO);
  }

  static async delete(id) {
    return EmailTemplateRepository.remove(id);
  }
}
