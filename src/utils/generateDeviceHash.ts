import { createHash } from "crypto";

export function generateDeviceHash(ip: string, userAgent: string): string {
  const raw = `${ip}:${userAgent}`;
  return createHash("sha256").update(raw).digest("hex");
}
