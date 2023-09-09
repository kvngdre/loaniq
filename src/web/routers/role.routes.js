import { Router } from "express";

import RoleController from "../controllers/role.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";

const router = Router();

router.post("/", auth, RoleController.create);

router.get("/", auth, RoleController.getRoles);

router.get("/:roleId", auth, validateIdMiddleware, RoleController.getRole);

router.patch("/:roleId", auth, validateIdMiddleware, RoleController.updateRole);

router.delete(
  "/:roleId",
  auth,
  validateIdMiddleware,
  RoleController.deleteRole,
);

export default router;
