import UserService from '../services/user.service'
import TenantService from '../services/tenant.service'

export const canUserResetPwd = async (userEmail) => {
  const { tenantId } = await UserService.getUser({ email: userEmail })
  const { allowUserPwdReset } = await TenantService.getConfig({
    tenantId
  })

  return allowUserPwdReset
}
