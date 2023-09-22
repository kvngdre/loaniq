import { RoleRepository } from "../../data/repositories/index.js";
import { messages } from "../../utils/messages.utils.js";

export class RoleService {
  static async all() {
    const foundRoles = await RoleRepository.find();

    return { message: messages.COMMON.FETCHED_Fn("Roles"), foundRoles };
  }

  static async create(createRoleDTO) {
    return RoleRepository.insert(createRoleDTO);
  }

  static async getRoleById(id) {
    const foundRole = await RoleRepository.findById(id);

    return foundRole;
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
