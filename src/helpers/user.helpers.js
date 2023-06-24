import UserService from '../services/user.service.js';
import TenantService from '../services/tenant.service.js';

export const canUserResetPwd = async (userEmail) => {
  const { tenantId } = await UserService.getUser({ email: userEmail });
  const { allowUserPwdReset } = await TenantService.getConfig({
    tenantId,
  });

  return allowUserPwdReset;
};
