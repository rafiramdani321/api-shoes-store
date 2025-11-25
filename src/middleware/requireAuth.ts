import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/accessToken";
import UserService from "../services/user.service";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authorization header missing or malformed.", 401);
    }

    const token = authHeader.split(" ")[1];
    if (token === null || !token) {
      throw new AppError("Access token not found.", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      throw new AppError("Invalid or expired access token.", 401);
    }

    if (!payload.user_id || !payload.session_id) {
      throw new AppError("Malformed token payload.", 400);
    }

    const user = await UserService.getById(payload.user_id);
    const session = user.Session.find(
      (s) =>
        s.id === payload.session_id && s.device_hash === payload.device_hash
    );
    if (!session) {
      throw new AppError(
        "Session not found or expired. Please login again.",
        401
      );
    }

    if (!session.refresh_token) {
      throw new AppError(
        "Session has been invalidated. Please login again.",
        401
      );
    }

    if (payload.token_version !== session.token_version) {
      throw new AppError(
        "Access token no longer valid. Please login again.",
        401
      );
    }

    req.user = payload;
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};
