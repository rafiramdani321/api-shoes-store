import { Router } from "express";

import AuthRateLimiter from "../libs/rate-limiter/auth.rate-limiter";
import { blockIfAuthenticated } from "../middleware/blockifAuthenticated";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import AuthController from "../controllers/auth.controller";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken";

const routerAuth = Router();

routerAuth.post(
  "/register",
  blockIfAuthenticated,
  AuthRateLimiter.registerLimiter,
  AuthController.register
);
routerAuth.get(
  "/verify-email/:token",
  AuthController.verifyEmailAccountActivation
);
routerAuth.post(
  "/resend-email-verification",
  AuthRateLimiter.resendEmailVerification,
  AuthController.resendTokenEmailVerification
);
routerAuth.post(
  "/login",
  blockIfAuthenticated,
  AuthRateLimiter.loginLimiter,
  AuthController.login
);
routerAuth.post("/logout", verifyAccessToken, AuthController.logout);
routerAuth.get("/me", verifyAccessToken, AuthController.getSelf);
routerAuth.get(
  "/refresh-token",
  verifyRefreshToken,
  AuthController.getRefreshToken
);

export default routerAuth;
