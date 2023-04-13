import Role from '../models/role.model.js'

class RoleService {
  create = async(newRoleDTO) => {
    const newRole = await Role.create(newRoleDTO).populate({
      path: 'permissions',
      select: 'name description'
    })

    return newRole
  }

  getRoles = async(tenantId) => {
    const foundRoles = await Role.find({ tenantId })
    const count = Intl.NumberFormat('en-US').format(foundRoles.length)

    return { count, foundRoles }
  }
}

export default new RoleService()
