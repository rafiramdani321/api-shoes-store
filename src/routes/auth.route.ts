import { Router } from "express";

import AuthRateLimiter from "../libs/rate-limiter/auth.rate-limiter";
import { blockIfAuthenticated } from "../middleware/blockifAuthenticated";
import { requireAuth } from "../middleware/requireAuth";
import AuthController from "../controllers/auth.controller";
import { requireAuthRefreshToken } from "../middleware/requireAuthRefreshToken";
import { validateRequest } from "../middleware/validateRequest";
import {
  loginValidation,
  registerValidation,
  resendEmailVerificationValidation,
} from "../validations/validation-schema";

const routerAuth = Router();

routerAuth.post(
  "/register",
  blockIfAuthenticated,
  AuthRateLimiter.registerLimiter,
  validateRequest(registerValidation),
  AuthController.register
);
routerAuth.get(
  "/verify-email/:token",
  AuthController.verifyEmailAccountActivation
);
routerAuth.post(
  "/resend-email-verification",
  AuthRateLimiter.resendEmailVerification,
  validateRequest(resendEmailVerificationValidation),
  AuthController.resendTokenEmailVerification
);
routerAuth.post(
  "/login",
  blockIfAuthenticated,
  AuthRateLimiter.loginLimiter,
  validateRequest(loginValidation),
  AuthController.login
);
routerAuth.post(
  "/google",
  blockIfAuthenticated,
  AuthRateLimiter.loginLimiter,
  AuthController.loginWithGoogle
);
routerAuth.post("/logout", requireAuth, AuthController.logout);
routerAuth.get("/me", requireAuth, AuthController.getSelf);
routerAuth.get(
  "/refresh-token",
  requireAuthRefreshToken,
  AuthController.getRefreshToken
);

export default routerAuth;
