import { Request, Response } from "express";
import { AppError } from "./errors";

export const handleSuccess = (
  res: Response,
  message: string = "Success",
  statusCode: number = 200,
  data: any = null
) => {
  res.status(statusCode).json({
    status: false,
    message,
    statusCode,
    data,
  });
};

export const errorResponse = (
  res: Response,
  error: string = "Error",
  statusCode: number = 500,
  details: any = null
) => {
  res.status(statusCode).json({
    error,
    statusCode,
    status: "error",
    details,
  });
};

export const handleError = (err: unknown, res: Response) => {
  if (err instanceof AppError) {
    if (process.env.NODE_ENV === "development") console.error(err);

    return res.status(err.statusCode).json({
      status: false,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details ?? null,
    });
  }

  if (process.env.NODE_ENV === "development") console.error(err);

  return res.status(500).json({
    status: false,
    message: "Internal server error",
  });
};
