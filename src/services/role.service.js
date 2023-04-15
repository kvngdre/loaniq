import RoleDAO from '../daos/role.dao.js'

class RoleService {
  /**
   * Creates a new user role.
   * @param {RoleAdd} newRoleDTO
   * @returns
   */
  static async createRole (newRoleDTO) {
    const newRole = await RoleDAO.insert(newRoleDTO)

    return newRole
  }

  static async getRoles () {
    const foundRoles = await RoleDAO.find()
    const count = Intl.NumberFormat('en-US').format(foundRoles.length)

    return { count, foundRoles }
  }

  static async getRoleById (roleId) {
    const foundRole = await RoleDAO.findById(roleId)

    return foundRole
  }

  static async getRole (filter) {
    const foundRole = await RoleDAO.findOne(filter)

    return foundRole
  }

  static async updateRole (roleId, updateRoleDTO) {
    const updatedRole = await RoleDAO.update(roleId, updateRoleDTO)

    return updatedRole
  }

  static async deleteRole (roleId) {
    const deletedRole = await RoleDAO.remove(roleId)

    return deletedRole
  }
}

export default RoleService
