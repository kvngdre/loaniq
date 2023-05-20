import RoleRepository from './role.repository.js';

class RoleService {
  /**
   * Creates a new user role.
   * @param {RoleAdd} newRoleDTO
   * @returns
   */
  static async createRole(newRoleDTO) {
    const newRole = await RoleRepository.insert(newRoleDTO);

    return newRole;
  }

  static async getRoles() {
    const foundRoles = await RoleRepository.find();
    const count = Intl.NumberFormat('en-US').format(foundRoles.length);

    return { count, foundRoles };
  }

  static async getRoleById(roleId) {
    const foundRole = await RoleRepository.findById(roleId);

    return foundRole;
  }

  static async getRole(filter) {
    const foundRole = await RoleRepository.findOne(filter);

    return foundRole;
  }

  static async updateRole(roleId, updateRoleDTO) {
    const updatedRole = await RoleRepository.update(roleId, updateRoleDTO);

    return updatedRole;
  }

  static async deleteRole(roleId) {
    const deletedRole = await RoleRepository.remove(roleId);

    return deletedRole;
  }
}

export default RoleService;
