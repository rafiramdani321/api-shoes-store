import { env } from "../constants/env";
import { signToken, verifyToken } from "../libs/jwt";
import { AppError } from "./errors";

const { JWT_TOKEN_EMAIL_VERIFICATION, EMAIL_TOKEN_VERIFICATION_EXPIRES_IN } =
  env;

if (!JWT_TOKEN_EMAIL_VERIFICATION) {
  throw new AppError(
    "Missing JWT_TOKEN_EMAIL_VERIFICATION in environments.",
    500
  );
}

export const signEmailVerificationToken = (email: string) => {
  return signToken(
    { email, type: "email_verification", issuedAt: Date.now() },
    JWT_TOKEN_EMAIL_VERIFICATION,
    EMAIL_TOKEN_VERIFICATION_EXPIRES_IN
  );
};

export const verifyEmailVerificationToken = (token: string) => {
  const decoded = verifyToken<{ email: string; type: string }>(
    token,
    JWT_TOKEN_EMAIL_VERIFICATION
  );
  if (decoded.type !== "email_verification") {
    throw new AppError("Invalid token type.", 400);
  }
  return decoded;
};
