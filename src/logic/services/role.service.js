import { RoleRepository } from "../../data/repositories/index.js";
import { NotFoundError } from "../../utils/errors/not-found.error.js";
import { messages } from "../../utils/messages.utils.js";

export class RoleService {
  static async all() {
    const roles = await RoleRepository.find();
    return { message: messages.COMMON.FETCHED_Fn("Roles"), data: roles };
  }

  static async create(createRoleDTO) {
    return RoleRepository.insert(createRoleDTO);
  }

  static async get(id) {
    const foundRole = await RoleRepository.findById(id);
    if (!foundRole) {
      throw new NotFoundError(messages.ERROR.NOT_FOUND_Fn("Role"));
    }

    return { message: messages.COMMON.FETCHED_Fn("Role"), data: foundRole };
  }

  static async getRole(filter) {
    const foundRole = await RoleRepository.findOne(filter);

    return foundRole;
  }

  static async update(id, updateRoleDTO) {
    const updatedRole = await RoleRepository.updateById(id, updateRoleDTO);

    return updatedRole;
  }

  static async delete(id) {
    return RoleRepository.deleteById(id);
  }
}
