import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        email: string;
        username: string;
        role: string | any;
        token_version: number;
        session_id: string;
        device_hash: string;
      };
      refreshToken?: string;
      session?: string | any;
    }
  }
}
