import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";
import verifyJWT from "../middleware/verify-jwt.middleware.js";

const router = Router();

router.post("/", verifyJWT, UserController.createUser);

router.post("/forgot-password", UserController.forgotPassword);

router.post("/verify-signup", UserController.verifySignup);

router.post(
  "/:userId/change-password",
  verifyJWT,
  UserController.changePassword,
);

router.post(
  "/:userId/deactivate",
  verifyJWT,
  validateIdMiddleware,
  UserController.deactivateUser,
);

router.get("/", verifyJWT, UserController.getUsers);

router.get("/me", verifyJWT, UserController.getCurrentUser);

router.get("/:userId", verifyJWT, validateIdMiddleware, UserController.getUser);

router.get(
  "/:userId/reactivate",
  verifyJWT,
  validateIdMiddleware,
  UserController.reactivateUser,
);

router.get(
  "/:userId/reset-password",
  verifyJWT,
  validateIdMiddleware,
  UserController.resetPassword,
);

router.patch(
  "/:userId",
  verifyJWT,
  validateIdMiddleware,
  UserController.updateUser,
);

router.delete(
  "/:userId",
  verifyJWT,
  validateIdMiddleware,
  UserController.deleteUser,
);

export default router;
