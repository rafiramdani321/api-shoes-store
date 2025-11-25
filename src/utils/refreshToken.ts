import { number, string } from "zod";
import { env } from "../constants/env";
import { signToken, verifyToken } from "../libs/jwt";
import { AppError } from "./errors";

const { JWT_REFRESH_TOKEN, JWT_REFRESH_TOKEN_EXPIRES_IN } = env;

if (!JWT_REFRESH_TOKEN) {
  throw new AppError("Missing JWT_REFRESH_TOKEN in environments.", 500);
}

export const signRefreshToken = (payload: object) => {
  return signToken(
    {
      payload,
      type: "refresh_token",
      issuedAt: Date.now(),
    },
    JWT_REFRESH_TOKEN,
    JWT_REFRESH_TOKEN_EXPIRES_IN
  );
};

export const verifyRefreshToken = (token: string) => {
  const decoded = verifyToken<{
    payload: {
      user_id: string;
      email: string;
      username: string;
      role: string | any;
      token_version: number;
      session_id: string;
      device_hash: string;
    };
    type: string;
    issuedAt: number;
    iat: number;
    exp: number;
  }>(token, JWT_REFRESH_TOKEN);
  if (decoded.type !== "refresh_token") {
    throw new AppError("Invalid token type.", 400);
  }

  return decoded.payload;
};
