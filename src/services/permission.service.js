import Permission from '../models/permission.model.js'

class PermissionService {
  create = async(newPermissionDTO) => {
    const newPermission = new Permission(newPermissionDTO)
    await newPermission.save()

    return newPermission
  }

  getPermissions = async() => {
    const permissions = await Permission.find()
    const count = Intl.NumberFormat('en-US').format(permissions.length)

    return { count, foundPermissions: permissions }
  }
}

export default new PermissionService()
