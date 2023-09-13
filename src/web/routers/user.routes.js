import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import validateIdMiddleware from "../middleware/validate-id.middleware.js";

export const userRouter = Router();

userRouter.post("/", auth, UserController.createUser);

userRouter.post("/forgot-password", UserController.forgotPassword);

userRouter.post(
  "/:userId/change-password",
  auth,
  UserController.changePassword,
);

userRouter.post(
  "/:userId/deactivate",
  auth,
  validateIdMiddleware,
  UserController.deactivateUser,
);

userRouter.get("/", auth, UserController.getUsers);

userRouter.get("/me", auth, UserController.getCurrentUser);

userRouter.get("/:userId", auth, validateIdMiddleware, UserController.getUser);

userRouter.get(
  "/:userId/reactivate",
  auth,
  validateIdMiddleware,
  UserController.reactivateUser,
);

userRouter.get(
  "/:userId/reset-password",
  auth,
  validateIdMiddleware,
  UserController.resetPassword,
);

userRouter.patch(
  "/:userId",
  auth,
  validateIdMiddleware,
  UserController.updateUser,
);

userRouter.delete(
  "/:userId",
  auth,
  validateIdMiddleware,
  UserController.deleteUser,
);
