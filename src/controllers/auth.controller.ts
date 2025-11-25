import { NextFunction, Request, Response } from "express";
import ms, { StringValue } from "ms";

import { env } from "../constants/env";
import { getClientInfo } from "../utils/getClientInfo";
import AuthService from "../services/auth.service";
import { handleSuccess } from "../utils/responses";
import { AppError } from "../utils/errors";
import {
  loginLogger,
  registerLogger,
  resendTokenVerifyLogger,
} from "../libs/logger/index.logger";

export default class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    try {
      const createdUser = await AuthService.register(req.body);

      registerLogger.info({
        event: "registration_success",
        email: createdUser.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(
        res,
        "Registration success, Please check your email for activation.",
        201,
        createdUser
      );
    } catch (error: any) {
      registerLogger.error({
        event: "registration_failed",
        email: req.body.email || "unknown",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async verifyEmailAccountActivation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const { token } = req.params;
    try {
      const response = await AuthService.verifyEmailAccountActivation(
        token,
        ip,
        userAgent
      );

      const refreshTokenMaxAge = ms(
        (env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue) || "7d"
      );

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      return handleSuccess(res, "Account has been verified success.", 200, {
        username: response.user.username,
        email: response.user.email,
        accessToken: response.accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async resendTokenEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const { email } = req.body;
    try {
      await AuthService.resendTokenEmailVerification(email);

      resendTokenVerifyLogger.info({
        event: "resend_email_verification_success",
        email: email || "unknown",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(
        res,
        "Resend email verification success. Please check your email.",
        200
      );
    } catch (error: any) {
      resendTokenVerifyLogger.error({
        event: "resend_email_verification_failed",
        email: email || "unknown",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    try {
      const { email, password } = req.body;

      const response = await AuthService.login(
        { email, password },
        { ip, userAgent }
      );

      const refreshTokenMaxAge = ms(
        (env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue) || "7d"
      );

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      loginLogger.info({
        event: "login_success",
        email: response.safeUser.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Login success", 200, {
        usernamae: response.safeUser.username,
        email: response.safeUser.email,
        accessToken: response.accessToken,
      });
    } catch (error: any) {
      loginLogger.error({
        event: "login_failed",
        email: req.body.email || "unknown",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async loginWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.body;
    const { ip, userAgent } = getClientInfo(req);
    try {
      const response = await AuthService.loginWithGoogle(token, {
        ip,
        userAgent,
      });

      const refreshTokenMaxAge = ms(
        (env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue) || "7d"
      );

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      return handleSuccess(res, "Google login success", 200, {
        username: response.username,
        email: response.email,
        accessToken: response.accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.user;
      if (!userData) {
        throw new AppError("Unauthorized: missing user data.", 401);
      }

      await AuthService.logout(userData);

      res.clearCookie("refreshToken");

      return handleSuccess(res, "Logout success", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSelf(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const user = req.user;

      return handleSuccess(res, "Success get user from access token.", 200, {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async getRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const currentUser = req.user;
    const currentRefreshToken = req.refreshToken;
    try {
      const response = await AuthService.refreshToken(
        currentUser!,
        currentRefreshToken!
      );

      return handleSuccess(res, "Access token refreshed success.", 200, {
        accessToken: response.newAccessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
