import TenantService from '../tenant/tenant.service.js';
import UserService from '../user/user.service.js';

export const canUserResetPwd = async (userEmail) => {
  const { tenantId } = await UserService.getUser({ email: userEmail });
  const { allowUserPwdReset } = await TenantService.getConfig({
    tenantId,
  });

  return allowUserPwdReset;
};
