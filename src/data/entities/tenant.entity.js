import { ValidationError } from "../../utils/errors/index.js";
import { Id, messages } from "../../utils/index.js";
import { TenantStatus } from "../constants/index.js";

export class TenantEntity {
  constructor({
    name,
    logo = null,
    category = null,
    documentation = null,
    configurations = null,
    status = TenantStatus.PENDING,
    cacNumber = null,
    state = null,
    address = null,
    id = Id.makeId(),
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    const data = TenantEntity.validate({
      logo,
      name,
      address,
      state,
      cacNumber,
      category,
      status,
      documentation,
      configurations,
      id,
      createdAt,
      updatedAt,
    });

    this.id = data.id;
    this.logo = data.logo;
    this.name = data.name;
    this.address = data.address;
    this.state = data.state;
    this.cacNumber = data.cacNumber;
    this.category = data.category;
    this.status = data.status;
    this.documentation = data.documentation;
    this.configurations = data.configurations;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate({
    logo,
    name,
    address,
    state,
    cacNumber,
    category,
    status,
    documentation,
    configurations,
    id,
    createdAt,
    updatedAt,
  }) {
    if (id && !Id.isValidId(id)) {
      throw new ValidationError(messages.ERROR.VALIDATION, {
        id: "User must have a valid id",
      });
    }

    return {
      logo,
      name,
      address,
      state,
      cacNumber,
      category,
      status,
      documentation,
      configurations,
      id,
      createdAt,
      updatedAt,
    };
  }
}
