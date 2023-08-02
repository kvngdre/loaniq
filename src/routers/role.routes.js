import { Router } from "express";

import validateIdMiddleware from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";
import RoleController from "../web/controllers/role.controller.js";

const router = Router();

router.post("/", verifyJWT, RoleController.create);

router.get("/", verifyJWT, RoleController.getRoles);

router.get("/:roleId", verifyJWT, validateIdMiddleware, RoleController.getRole);

router.patch(
  "/:roleId",
  verifyJWT,
  validateIdMiddleware,
  RoleController.updateRole,
);

router.delete(
  "/:roleId",
  verifyJWT,
  validateIdMiddleware,
  RoleController.deleteRole,
);

export default router;
