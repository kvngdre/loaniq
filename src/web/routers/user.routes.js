import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import {
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest,
} from "../middleware/index.js";
import { createUserValidator } from "../validators/index.js";

export const userRouter = Router();

userRouter.post(
  "/",
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest.with(createUserValidator),
  UserController.create,
);

userRouter.post(
  "/:userId/change-password",
  auth,
  UserController.changePassword,
);

userRouter.post("/:userId/deactivate", auth, UserController.deactivateUser);

userRouter.get("/", auth, checkUserStatus, UserController.index);

userRouter.get("/me", auth, UserController.getCurrentUser);

userRouter.get("/:userId", auth, UserController.show);

userRouter.get("/:userId/reactivate", auth, UserController.reactivateUser);

userRouter.get("/:userId/reset-password", auth, UserController.resetPassword);

userRouter.patch("/:id", auth, UserController.edit);

userRouter.delete("/:id", auth, checkUserStatus, UserController.destroy);
