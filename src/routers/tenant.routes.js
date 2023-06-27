import { Router } from "express";

import { tenantController } from "../controllers/index.js";
import checkPermission from "../middleware/checkPermission.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();

router.post("/sign-up", tenantController.signUp);

router.post(
  "/:tenantId/activate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("submitToActivateOwn", "tenant"),
  tenantController.requestTenantActivavtion,
);

router.post(
  "/:tenantId/deactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("requestToDeactivateOwn", "tenant"),
  tenantController.requestTenantActivavtion,
);

router.post(
  "/:tenantId/onboard",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("onBoardOwn", "tenant"),
  tenantController.onBoardTenant,
);

router.get("/forms/:formId", tenantController.getPublicFormData);

router.get(
  "/self",
  verifyJWT,
  checkPermission("viewOwn", "tenant"),
  tenantController.getCurrentTenant,
);

router.get(
  "/",
  verifyJWT,
  checkPermission("viewAny", "tenant"),
  tenantController.getTenants,
);

router.get(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("viewOwn", "tenant"),
  tenantController.getTenant,
);

router.get(
  "/:tenantId/deactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("deactivateAny", "tenant"),
  tenantController.requestToDeactivateTenant,
);

router.get(
  "/:tenantId/public-url",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("generateOwnUrl", "tenant"),
  tenantController.generatePublicUrl,
);

router.get(
  "/:tenantId/reactivate",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("reactivateOwn", "tenant"),
  tenantController.reactivateTenant,
);

router.patch(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("updateOwn", "tenant"),
  tenantController.updateTenant,
);

router.delete(
  "/:tenantId",
  verifyJWT,
  validateIdMiddleware,
  checkPermission("delete", "tenant"),
  tenantController.deleteTenant,
);

export default router;
