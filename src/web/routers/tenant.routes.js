import { Router } from "express";

import { TenantController } from "../controllers/index.js";
import { auth } from "../middleware/auth.middleware.js";
import checkPermission from "../middleware/checkPermission.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";

export const tenantRouter = Router();

tenantRouter.post(
  "/:tenantId/activate",
  auth,
  validateIdMiddleware,
  checkPermission("submitToActivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

tenantRouter.post(
  "/:tenantId/deactivate",
  auth,
  validateIdMiddleware,
  checkPermission("requestToDeactivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

tenantRouter.post(
  "/:tenantId/onboard",
  auth,
  validateIdMiddleware,
  checkPermission("onBoardOwn", "tenant"),
  TenantController.onBoardTenant,
);

tenantRouter.get("/forms/:formId", TenantController.getPublicFormData);

tenantRouter.get(
  "/self",
  auth,
  checkPermission("viewOwn", "tenant"),
  TenantController.getCurrentTenant,
);

tenantRouter.get(
  "/",
  auth,
  // checkPermission("viewAny", "tenant"),
  TenantController.getTenants,
);

tenantRouter.get(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("viewOwn", "tenant"),
  TenantController.getTenant,
);

tenantRouter.get(
  "/:tenantId/deactivate",
  auth,
  validateIdMiddleware,
  checkPermission("deactivateAny", "tenant"),
  TenantController.requestToDeactivateTenant,
);

tenantRouter.get(
  "/:tenantId/public-url",
  auth,
  validateIdMiddleware,
  checkPermission("generateOwnUrl", "tenant"),
  TenantController.generatePublicUrl,
);

tenantRouter.get(
  "/:tenantId/reactivate",
  auth,
  validateIdMiddleware,
  checkPermission("reactivateOwn", "tenant"),
  TenantController.reactivateTenant,
);

tenantRouter.patch(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("updateOwn", "tenant"),
  TenantController.updateTenant,
);

tenantRouter.delete(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("delete", "tenant"),
  TenantController.deleteTenant,
);
