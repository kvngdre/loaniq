import { roleRepository } from "../../data/repositories/role.repository.js";

class RoleService {
  static async createRole(createRoleDTO) {
    return roleRepository.insert(createRoleDTO);
  }

  async getRoles() {
    const foundRoles = await roleRepository.find();
    const count = Intl.NumberFormat("en-US").format(foundRoles.length);

    return { count, foundRoles };
  }

  async getRoleById(roleId) {
    const foundRole = await roleRepository.findById(roleId);

    return foundRole;
  }

  async getRole(filter) {
    const foundRole = await roleRepository.findOne(filter);

    return foundRole;
  }

  async updateRole(roleId, updateRoleDTO) {
    const updatedRole = await roleRepository.update(roleId, updateRoleDTO);

    return updatedRole;
  }

  async deleteRole(roleId) {
    const deletedRole = await roleRepository.remove(roleId);

    return deletedRole;
  }
}

export default RoleService;
