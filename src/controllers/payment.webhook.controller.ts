import { NextFunction, Request, Response } from "express";
import { PaymentWebhookService } from "../services/payment.webhook.service";
import { handleSuccess } from "../utils/responses";

export class PaymentWebhookController {
  static async handle(req: Request, res: Response, next: NextFunction) {
    try {
      await PaymentWebhookService.handleNotification(req.body);
      return handleSuccess(res, "Handle notification midtrans success", 200, {
        received: true,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
