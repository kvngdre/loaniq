import { Router } from "express";

import { AuthController } from "../controllers/index.js";
import { ValidateRequest, auth, checkStatus } from "../middleware/index.js";
import {
  loginValidator,
  requestOtpValidator,
  signUpValidator,
  verifyValidator,
} from "../validators/index.js";

const router = Router();

router.post(
  "/register",
  ValidateRequest.with(signUpValidator),
  AuthController.register,
);

router.post(
  "/verify",
  ValidateRequest.with(verifyValidator),
  AuthController.verify,
);

router.post(
  "/login",
  ValidateRequest.with(loginValidator),
  AuthController.login,
);

router.post("/callback", AuthController.callback);

router.post(
  "/request-otp",
  ValidateRequest.with(requestOtpValidator),
  AuthController.requestOTP,
);

router.post("/logout", auth, AuthController.logout);

router.get(
  "/sessions/logout",
  auth,
  checkStatus,
  AuthController.logOutAllSessions,
);

router.get("/tokens", auth, AuthController.genTokens);

export default router;
