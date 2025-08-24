import { Request, Response } from "express";
import { getClientInfo } from "../utils/getClientInfo";
import AuthService from "../services/auth.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import {
  loginLogger,
  registerLogger,
  resendTokenVerifyLogger,
} from "../libs/logger/index.logger";
import { generateDeviceHash } from "../utils/generateDeviceHash";

export default class AuthController {
  static async register(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    try {
      const response = await AuthService.registerUser(data);

      registerLogger.info({
        event: "registration_success",
        email: data?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(
        res,
        "Registration success, Please check your email for activation.",
        201,
        { username: response.username, email: response.email }
      );
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      registerLogger.error({
        event: "registration_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async verifyEmailAccountActivation(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const { token } = req.params;
    try {
      const result = await AuthService.verifyEmailAccountActivation(
        token,
        ip,
        userAgent
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, "Email verified success.", 200, {
        username: result.user.username,
        email: result.user.email,
        accessToken: result.accessToken,
      });
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async resendTokenEmailVerification(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const email = req.body?.email;
    try {
      await AuthService.resendTokenEmailVerification(email);

      resendTokenVerifyLogger.info({
        event: "send_email_verification_success",
        email: email || "unknown",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(
        res,
        "Resend email verification success. Please check your email.",
        200
      );
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      resendTokenVerifyLogger.error({
        event: "send_email_verification_failed",
        email: email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async login(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const deviceHash = generateDeviceHash(ip, userAgent);

    const data = await req.body;

    try {
      const user = await AuthService.loginUser(data, {
        ip,
        userAgent,
        deviceHash,
      });

      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      loginLogger.info({
        event: "login_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Login success", 200, {
        usernamae: user.username,
        email: user.email,
        accessToken: user.accessToken,
      });
    } catch (error: any) {
      const isKnownError = error instanceof AppError;
      loginLogger.error({
        event: "login_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userData = req.user;

      await AuthService.logoutUser(userData!);

      res.clearCookie("refreshToken");

      return successResponse(res, "Logout success", 200);
    } catch (error) {
      const isKnownError = error instanceof AppError;

      return errorResponse(
        res,
        isKnownError ? error.message : "Invalid or expired access token.",
        isKnownError ? error.statusCode : 401,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async getSelf(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const user = req.user;

      return successResponse(res, "Success get user from access token.", 200, {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      const isKnownError = error instanceof AppError;

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async getRefreshToken(req: Request, res: Response) {
    const currentUser = req.user;
    const currentRefreshToken = req.refreshToken;
    try {
      const response = await AuthService.refreshToken(
        currentUser!,
        currentRefreshToken!
      );

      return successResponse(res, "Access token refreshed success.", 200, {
        accessToken: response.newAccessToken,
      });
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Failed to refresh token.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }
}
