import { EmailTemplateRepository } from "../../data/repositories/index.js";
import { NotFoundError } from "../../utils/errors/index.js";
import { messages } from "../../utils/messages.utils.js";

export class EmailTemplateService {
  static async all(filter = {}) {
    const templates = await EmailTemplateRepository.find(filter);
    if (templates.length === 0) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Templates"));
    }

    return {
      message: messages.COMMON.FETCHED_Fn("Templates"),
      data: templates,
    };
  }

  static async create(createTemplateDto) {
    const template = await EmailTemplateRepository.insert(createTemplateDto);

    return {
      message: messages.COMMON.CREATED_Fn("Template"),
      data: template,
    };
  }

  static async get(id) {
    const template = await EmailTemplateRepository.findById(id);
    if (!template) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Template"));
    }

    return {
      message: messages.COMMON.FETCHED_Fn("Template"),
      data: template,
    };
  }

  static async update(id, updateTemplateDto) {
    const template = await EmailTemplateRepository.updateById(
      id,
      updateTemplateDto,
    );
    if (!template) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Template"));
    }

    return {
      message: messages.COMMON.UPDATED_Fn("Template"),
      data: template,
    };
  }

  static async delete(id) {
    const template = await EmailTemplateRepository.deleteById(id);
    if (!template) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Template"));
    }

    return {
      message: messages.COMMON.DELETED_Fn("Template"),
    };
  }
}
