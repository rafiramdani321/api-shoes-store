import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";
import { handleSuccess } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import ms, { StringValue } from "ms";
import { env } from "../constants/env";

export default class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await UserService.getUsers(req.query);
      return handleSuccess(res, "Fetching users data success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unathorized", 401);
      }
      const { user_id } = req.user;
      const user = await UserService.getById(user_id);

      const { password, role, Cart, Session, ...safeResponse } = user;
      return handleSuccess(res, "Get my profile success.", 200, {
        ...safeResponse,
        has_password: Boolean(password),
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Unathorized.", 401);
      }
      const data = req.body;

      const payload = {
        ...data,
        id: req.user.user_id,
      };
      await UserService.updateMe(payload);
      return handleSuccess(res, "Update data success.", 200);
    } catch (error: any) {
      console.log(error);
      next(error);
    }
  }

  static async updateMeImageProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unathorized.", 401);
      }

      const files = req.files as Express.Multer.File[];

      const payload = {
        userId: req.user.user_id,
        files,
      };
      await UserService.updateMeImageProfile(payload);

      return handleSuccess(res, "Upload image profile success.", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteImageProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new AppError("Unathorized.", 401);
      }

      await UserService.deleteImageProfile(req.user.user_id);

      return handleSuccess(res, "Delete image profile success.", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateEmailMe(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      await UserService.updateEmailMe({
        email,
        user_id: req.user.user_id,
      });

      return handleSuccess(res, "Please check your mail for activation.", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyNewEmailActivation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const { token } = req.params;
    try {
      const response = await UserService.verifyNewEmailActivation(
        token,
        ip,
        userAgent
      );

      res.clearCookie("refreshToken");

      const refreshTokenMaxAge = ms(
        (env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue) || "7d"
      );

      res.cookie("refreshToken", response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: refreshTokenMaxAge,
      });

      return handleSuccess(res, "New email has been verified.", 200, {
        username: response.user.username,
        email: response.user.email,
        accessToken: response.accessToken,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async setMyPassword(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { password, confirmPassword } = req.body;

    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized", 401);
      }

      const response = await UserService.setMyPassword({
        userId: user?.user_id,
        password,
        confirmPassword,
      });

      res.clearCookie("refreshToken");

      return handleSuccess(res, "Set password success. Please re-login.", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async changeMyPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await UserService.changeMyPassword({
        userId: user?.user_id,
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      res.clearCookie("refreshToken");

      return handleSuccess(
        res,
        "Change password success. Please Login again.",
        200
      );
    } catch (error: any) {
      next(error);
    }
  }
}
