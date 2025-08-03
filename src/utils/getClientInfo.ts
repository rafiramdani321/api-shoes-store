import { Request } from "express";

export const getClientInfo = (req: Request) => {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "";
  const userAgent = req.headers["user-agent"] || "unknown";
  return { ip, userAgent };
};
