import crypto from "crypto";
import { env } from "../constants/env";

export function verifyMidtransSignature(payload: any) {
  const serverKey = env.MIDTRANS_SERVER_KEY;
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(raw).digest("hex");

  return hash === payload.signature_key;
}
