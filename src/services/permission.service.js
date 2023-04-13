import PermissionDAO from '../daos/permission.dao.js'

class PermissionService {
  static async create(newPermissionDTO) {
    const newPermission = await PermissionDAO.insert(newPermissionDTO)

    return newPermission
  }

  static async getPermissions() {
    const foundPermissions = await PermissionDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundPermissions.length)

    return { count, foundPermissions }
  }

  static async getPermission(permissionId) {
    const foundPermission = await PermissionDAO.findById(permissionId)

    return foundPermission
  }

  static async updatePermission(permissionId, permissionUpdateDTO) {
    const updatedPermission = await PermissionDAO.update(permissionId, permissionUpdateDTO)

    return updatedPermission
  }

  static async deletePermission(permissionId) {
    const deletedPermission = await PermissionDAO.remove(permissionId)

    return deletedPermission
  }
}

export default PermissionService
