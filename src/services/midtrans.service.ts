import { env } from "../constants/env";
import { AppError } from "../utils/errors";

export class MidtransService {
  static async cancelPayment(transaction_id: string) {
    const url = `${env.MIDTRANS_API}/${transaction_id}/cancel`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization:
          "Basic " +
          Buffer.from(env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new AppError(
        `Midtrans cancel failed: ${result.status_message || "unknown error"}`
      );
    }

    return result;
  }
}
