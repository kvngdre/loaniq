import TenantService from "../services/tenant.service";
import ErrorResponse from "../utils/ErrorResponse";
import { HttpCode, status } from "../utils/common";

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const isTenantActivated = async (req, res, next) => {
  const tenant = await TenantService.getTenant(req.currentUser.tenantId);

  if (tenant.status !== status.ACTIVE) {
    return res.status(HttpCode.FORBIDDEN).json(
      new ErrorResponse({
        name: "Auth Error",
        errors: "Tenant not activated.",
      }),
    );
  }

  next();
};

export default isTenantActivated;
