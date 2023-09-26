import { Router } from "express";

import { UserController } from "../controllers/user.controller.js";
import {
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest,
} from "../middleware/index.js";
import {
  changeUserPasswordValidator,
  createUserValidator,
  idValidator,
  updateUserValidator,
} from "../validators/index.js";

export const userRouter = Router();

userRouter.post(
  "/",
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest.with(createUserValidator),
  UserController.create,
);

userRouter.patch(
  "/change-password",
  auth,
  checkUserStatus,
  ValidateRequest.with(changeUserPasswordValidator),
  UserController.changePassword,
);

userRouter.patch(
  "/:id",
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest.with(updateUserValidator),
  UserController.edit,
);

userRouter.patch(
  "/:id/deactivate",
  auth,
  checkUserStatus,
  ValidateRequest.with(idValidator),
  UserController.deactivate,
);

userRouter.patch(
  "/:id/reactivate",
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest.with(idValidator),
  UserController.reactivate,
);

userRouter.patch(
  "/:id/reset-password",
  auth,
  checkUserStatus,
  ValidateRequest.with(idValidator),
  UserController.resetPassword,
);

userRouter.get("/", auth, checkUserStatus, UserController.index);

userRouter.get("/me", auth, checkUserStatus, UserController.showCurrentUser);

userRouter.get(
  "/:id",
  auth,
  checkUserStatus,
  requirePasswordReset,
  ValidateRequest.with(idValidator),
  UserController.show,
);

userRouter.delete(
  "/:id",
  auth,
  checkUserStatus,
  ValidateRequest.with(idValidator),
  UserController.destroy,
);
