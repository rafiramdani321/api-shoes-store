import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { PaymentService } from "../services/payment.service";
import { handleSuccess } from "../utils/responses";

export class PaymentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.user_id;
    const { orderId } = req.params;
    try {
      if (!userId) throw new AppError("Unauthorized", 401);

      const response = await PaymentService.createSnapPayment(orderId, userId);
      return handleSuccess(res, "Payment created", 200, response);
    } catch (error: any) {
      next(error);
    }
  }
}
