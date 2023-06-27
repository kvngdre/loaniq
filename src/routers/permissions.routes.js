import { Router } from "express";
import validateObjectId from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import PermissionController from "../web/controllers/permission.controller.js";

const router = Router();

router.post("/", [verifyJWT], PermissionController.create);

router.get("/", [verifyJWT], PermissionController.getPermissions);

router.get(
  "/:permissionId",
  [verifyJWT, validateObjectId],
  PermissionController.getPermission,
);

router.patch(
  "/:permissionId",
  [verifyJWT, validateObjectId],
  PermissionController.updatePermission,
);

router.delete(
  "/:permissionId",
  [verifyJWT, validateObjectId],
  PermissionController.deletePermission,
);

export default router;
