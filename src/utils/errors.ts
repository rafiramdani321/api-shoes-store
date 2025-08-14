export class AppError extends Error {
  public statusCode: number;
  public details?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode = 500,
    details?: { field: string; message: string; options?: string }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
