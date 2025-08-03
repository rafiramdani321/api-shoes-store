import { NextFunction, Request, Response } from "express";
import { verifySignAccessToken } from "../libs/jwt";
import { errorResponse } from "../utils/responses";
import SessionRepository from "../repositories/session.repository";

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

    const payload = verifySignAccessToken(token);
    if (payload) {
      const session = await SessionRepository.findSessionById(
        payload.sessionId
      );
      if (session?.refresh_token) {
        return errorResponse(res, "already logged in.", 403);
      } else {
        next();
      }
    }
  } catch (error) {
    return next();
  }
};
