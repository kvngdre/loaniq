import { Router } from "express";

import { TenantController } from "../controllers/index.js";
import checkPermission from "../middleware/checkPermission.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();

router.post(
  "/:tenantId/activate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("submitToActivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

router.post(
  "/:tenantId/deactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("requestToDeactivateOwn", "tenant"),
  TenantController.requestTenantActivation,
);

router.post(
  "/:tenantId/onboard",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("onBoardOwn", "tenant"),
  TenantController.onBoardTenant,
);

router.get("/forms/:formId", TenantController.getPublicFormData);

router.get(
  "/self",
  verifyJWT,
  checkPermission("viewOwn", "tenant"),
  TenantController.getCurrentTenant,
);

router.get(
  "/",
  verifyJWT,
  // checkPermission("viewAny", "tenant"),
  TenantController.getTenants,
);

router.get(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("viewOwn", "tenant"),
  TenantController.getTenant,
);

router.get(
  "/:tenantId/deactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("deactivateAny", "tenant"),
  TenantController.requestToDeactivateTenant,
);

router.get(
  "/:tenantId/public-url",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("generateOwnUrl", "tenant"),
  TenantController.generatePublicUrl,
);

router.get(
  "/:tenantId/reactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("reactivateOwn", "tenant"),
  TenantController.reactivateTenant,
);

router.patch(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("updateOwn", "tenant"),
  TenantController.updateTenant,
);

router.delete(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("delete", "tenant"),
  TenantController.deleteTenant,
);

export default router;
