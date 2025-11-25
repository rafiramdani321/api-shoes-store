import { NextFunction, Request, Response } from "express";
import SessionRepository from "../repositories/session.repository";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/accessToken";

export const blockIfAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null || !token) {
      return next();
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      return next();
    }

    if (!payload.session_id) return next();

    const session = await SessionRepository.findSessionById(payload.session_id);
    if (session?.refresh_token) {
      throw new AppError("Already logged in.", 403);
    }

    return next();
  } catch (error: any) {
    next(error);
  }
};
