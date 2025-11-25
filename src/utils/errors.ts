export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: { field: string; message: string; options?: string }[];

  constructor(
    message: string,
    statusCode = 400,
    details?: { field: string; message: string; options?: string }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
