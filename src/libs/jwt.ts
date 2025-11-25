import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors";

export const signToken = (
  payload: object,
  secret: string,
  expiresIn: string | number
) => {
  try {
    return jwt.sign(payload, secret as jwt.Secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  } catch (error) {
    throw new AppError("Failed to sign token.", 500);
  }
};

export const verifyToken = <T>(token: string, secret: string): T => {
  try {
    return jwt.verify(token, secret) as T;
  } catch (error) {
    throw new AppError("Invalid or expired token.", 500);
  }
};
