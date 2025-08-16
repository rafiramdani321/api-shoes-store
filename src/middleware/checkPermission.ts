import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import UserRepository from "../repositories/user.repository";
import { errorResponse } from "../utils/responses";

export const checkPermission =
  (allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await UserRepository.findUserById(req.user.id);

      if (!user?.role) {
        throw new AppError("Role not found", 403);
      }

      const userPermission =
        user.role.RolePermission.map((rp) => rp.permission.name) || [];

      const hasPermission = allowedRoles.some((perm) =>
        userPermission.includes(perm)
      );

      if (!hasPermission) {
        throw new AppError("Forbidden: insufficient permission", 403);
      }

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
