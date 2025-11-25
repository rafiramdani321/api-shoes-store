import { env } from "../constants/env";
import { signToken, verifyToken } from "../libs/jwt";
import { AppError } from "./errors";

const { JWT_ACCESS_TOKEN, JWT_ACCESS_TOKEN_EXPIRES_IN } = env;

if (!JWT_ACCESS_TOKEN) {
  throw new AppError("Missing JWT_ACCESS_TOKEN in environments.", 500);
}

export const signAccessToken = (payload: object) => {
  return signToken(
    {
      payload,
      type: "access_token",
      issuedAt: Date.now(),
    },
    JWT_ACCESS_TOKEN,
    JWT_ACCESS_TOKEN_EXPIRES_IN
  );
};

export const verifyAccessToken = (token: string) => {
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
  }>(token, JWT_ACCESS_TOKEN);
  if (decoded.type !== "access_token") {
    throw new AppError("Invalid token tyoe.", 400);
  }
  return decoded.payload;
};
