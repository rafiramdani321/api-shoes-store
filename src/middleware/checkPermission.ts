import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import UserRepository from "../repositories/user.repository";

export const checkPermission =
  (allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await UserRepository.findById(req.user.user_id);

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
    } catch (error: any) {
      next(error);
    }
  };
