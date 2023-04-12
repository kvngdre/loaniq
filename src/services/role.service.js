import Role from '../models/role.model.js'

class RoleService {
  create = async(newRoleDTO) => {
    const newRole = new Role(newRoleDTO)
    await newRole.save()

    return newRole
  }

  getRoles = async(tenantId) => {
    const foundRoles = await Role.find({ tenantId })
    const count = Intl.NumberFormat('en-US').format(foundRoles.length)

    return { count, foundRoles }
  }
}

export default new RoleService()
