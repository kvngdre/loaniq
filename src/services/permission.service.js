import PermissionDAO from "../daos/permission.dao.js";

class PermissionService {
  static async createPermission(newPermissionDTO) {
    const newPermission = await PermissionDAO.insert(newPermissionDTO);

    return newPermission;
  }

  static async getPermissions() {
    const foundPermissions = await PermissionDAO.find();
    const count = Intl.NumberFormat("en-US").format(foundPermissions.length);

    return { count, foundPermissions };
  }

  static async getPermission(permissionId) {
    const foundPermission = await PermissionDAO.findById(permissionId);

    return foundPermission;
  }

  static async updatePermission(permissionId, updatePermissionDTO) {
    const updatedPermission = await PermissionDAO.update(
      permissionId,
      updatePermissionDTO,
    );

    return updatedPermission;
  }

  static async deletePermission(permissionId) {
    const deletedPermission = await PermissionDAO.remove(permissionId);

    return deletedPermission;
  }
}

export default PermissionService;
