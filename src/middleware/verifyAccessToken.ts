import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifySignAccessToken } from "../libs/jwt";
import UserRepository from "../repositories/user.repository";
import { errorResponse } from "../utils/responses";

export const verifyAccessToken = async (
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

    let decoded;
    try {
      decoded = verifySignAccessToken(token);
    } catch (error) {
      throw new AppError("Invalid or expired access token.", 401);
    }

    const user = await UserRepository.findUserById(decoded.id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const session = user.Session.find(
      (s) => s.id === decoded.sessionId && s.device_hash === decoded.deviceHash
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

    if (decoded.tokenVersion !== session.token_version) {
      throw new AppError(
        "Access token no longer valid. Please login again.",
        401
      );
    }

    req.user = decoded;
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
