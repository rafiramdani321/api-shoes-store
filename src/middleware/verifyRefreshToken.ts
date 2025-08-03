import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifySignRefreshToken } from "../libs/jwt";
import UserRepository from "../repositories/user.repository";
import { errorResponse } from "../utils/responses";

export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new AppError("Refresh token not found.", 401);
    }

    const decoded = verifySignRefreshToken(token);
    const user = await UserRepository.findUserById(decoded.id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const session = user.Session.find(
      (s) =>
        s.id === decoded.sessionId &&
        s.refresh_token === token &&
        s.device_hash === decoded.deviceHash
    );

    if (!session) {
      throw new AppError("Invalid session. Please login again.", 401);
    }

    req.user = decoded;
    req.refreshToken = token;
    req.session = session;
    next();
  } catch (error) {
    const isKnownError = error instanceof AppError;
    return errorResponse(
      res,
      isKnownError ? error.message : "Internal server error.",
      isKnownError ? error.statusCode : 500,
      isKnownError ? error.details : undefined
    );
  }
};
