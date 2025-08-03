import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string | any;
        tokenVersion: number;
        sessionId: string;
        deviceHash: string;
      };
      refreshToken?: string;
      session?: string | any;
    }
  }
}
