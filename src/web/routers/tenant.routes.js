import { Router } from "express";

import { TenantController } from "../controllers/index.js";
import { auth } from "../middleware/auth.middleware.js";
import checkPermission from "../middleware/checkPermission.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";

const router = Router();

router.post(
  "/:tenantId/activate",
  auth,
  validateIdMiddleware,
  checkPermission("submitToActivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

router.post(
  "/:tenantId/deactivate",
  auth,
  validateIdMiddleware,
  checkPermission("requestToDeactivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

router.post(
  "/:tenantId/onboard",
  auth,
  validateIdMiddleware,
  checkPermission("onBoardOwn", "tenant"),
  TenantController.onBoardTenant,
);

router.get("/forms/:formId", TenantController.getPublicFormData);

router.get(
  "/self",
  auth,
  checkPermission("viewOwn", "tenant"),
  TenantController.getCurrentTenant,
);

router.get(
  "/",
  auth,
  // checkPermission("viewAny", "tenant"),
  TenantController.getTenants,
);

router.get(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("viewOwn", "tenant"),
  TenantController.getTenant,
);

router.get(
  "/:tenantId/deactivate",
  auth,
  validateIdMiddleware,
  checkPermission("deactivateAny", "tenant"),
  TenantController.requestToDeactivateTenant,
);

router.get(
  "/:tenantId/public-url",
  auth,
  validateIdMiddleware,
  checkPermission("generateOwnUrl", "tenant"),
  TenantController.generatePublicUrl,
);

router.get(
  "/:tenantId/reactivate",
  auth,
  validateIdMiddleware,
  checkPermission("reactivateOwn", "tenant"),
  TenantController.reactivateTenant,
);

router.patch(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("updateOwn", "tenant"),
  TenantController.updateTenant,
);

router.delete(
  "/:tenantId",
  auth,
  validateIdMiddleware,
  checkPermission("delete", "tenant"),
  TenantController.deleteTenant,
);

export default router;
