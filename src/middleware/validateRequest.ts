import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new AppError("Request body cannot be empty.", 400);
      }

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError(
          "Validation failed.",
          400,
          validation.error.issues.map((issue) => ({
            field: String(issue.path[0]),
            message: issue.message,
          }))
        );
      }

      req.body = validation.data;
      next();
    } catch (error) {
      next(error);
    }
  };
