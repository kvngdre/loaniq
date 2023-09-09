import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";

const router = Router();

router.post("/", auth, UserController.createUser);

router.post("/forgot-password", UserController.forgotPassword);

router.post("/:userId/change-password", auth, UserController.changePassword);

router.post(
  "/:userId/deactivate",
  auth,
  validateIdMiddleware,
  UserController.deactivateUser,
);

router.get("/", auth, UserController.getUsers);

router.get("/me", auth, UserController.getCurrentUser);

router.get("/:userId", auth, validateIdMiddleware, UserController.getUser);

router.get(
  "/:userId/reactivate",
  auth,
  validateIdMiddleware,
  UserController.reactivateUser,
);

router.get(
  "/:userId/reset-password",
  auth,
  validateIdMiddleware,
  UserController.resetPassword,
);

router.patch("/:userId", auth, validateIdMiddleware, UserController.updateUser);

router.delete(
  "/:userId",
  auth,
  validateIdMiddleware,
  UserController.deleteUser,
);

export default router;
