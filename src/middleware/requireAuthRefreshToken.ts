import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";
import { verifyRefreshToken } from "../utils/refreshToken";
import UserService from "../services/user.service";

export const requireAuthRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AppError("Refresh token not found.", 401);
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      throw new AppError("Invalid or expired refresh token.", 401);
    }
    if (!payload.user_id || !payload.session_id) {
      throw new AppError("Malformed refresh token payload.", 400);
    }
    const user = await UserService.getById(payload.user_id);
    const session = user.Session.find(
      (s) =>
        s.id === payload.session_id &&
        s.refresh_token === token &&
        s.device_hash === payload.device_hash
    );

    if (!session) {
      throw new AppError("Invalid session. Please login again.", 401);
    }

    req.user = payload;
    req.refreshToken = token;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};
