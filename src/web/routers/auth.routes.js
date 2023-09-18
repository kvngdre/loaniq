import { Router } from "express";

import { AuthController } from "../controllers/index.js";
import {
  ValidateRequest,
  auth,
  checkUserStatus,
  requirePasswordReset,
} from "../middleware/index.js";
import {
  forgotPasswordValidator,
  loginValidator,
  requestOtpValidator,
  resetPasswordWithVerificationValidator,
  resetPasswordWithoutVerificationValidator,
  signUpValidator,
  verifyRegistrationValidator,
} from "../validators/index.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  ValidateRequest.with(signUpValidator),
  AuthController.register,
);

authRouter.post(
  "/verify-registration",
  ValidateRequest.with(verifyRegistrationValidator),
  AuthController.verifyRegistration,
);

authRouter.post(
  "/login",
  ValidateRequest.with(loginValidator),
  requirePasswordReset,
  checkUserStatus,
  AuthController.login,
);

authRouter.post("/logout", auth, AuthController.logout);

authRouter.post(
  "/logout-all-sessions",
  auth,
  checkUserStatus,
  AuthController.logOutAllSessions,
);
authRouter.post(
  "/refresh-tokens",
  auth,
  requirePasswordReset,
  checkUserStatus,
  AuthController.refreshTokenSet,
);

authRouter.post(
  "/request-otp",
  ValidateRequest.with(requestOtpValidator),
  AuthController.requestOTP,
);

authRouter.post(
  "/forgot-password",
  ValidateRequest.with(forgotPasswordValidator),
  AuthController.forgotPassword,
);

authRouter.post(
  "/reset-password-with-verification",
  ValidateRequest.with(resetPasswordWithVerificationValidator),
  AuthController.resetPasswordWithVerification,
);

authRouter.post(
  "/reset-password",
  ValidateRequest.with(resetPasswordWithoutVerificationValidator),
  AuthController.resetPasswordWithoutVerification,
);
