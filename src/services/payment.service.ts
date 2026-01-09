import { env } from "../constants/env";
import { snap } from "../libs/midtrans";
import { OrderRepository } from "../repositories/order.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { AppError } from "../utils/errors";

export class PaymentService {
  static async createSnapPayment(orderId: string, userId: string) {
    const order = await OrderRepository.findByIdAndUserId(orderId, userId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === "PAID") {
      throw new AppError("Order already paid.", 409);
    }

    if (order.status === "CANCELLED") {
      throw new AppError("Order is cancelled.", 409);
    }

    const existingPayment = await PaymentRepository.findLatestPendingByOrderId(
      order.id
    );
    if (existingPayment?.snap_token && existingPayment?.snap_redirect_url) {
      return {
        snap_token: existingPayment.snap_token,
        snap_redirect_url: existingPayment.snap_redirect_url,
      };
    }

    const payment = await PaymentRepository.create(
      order.id,
      "midtrans",
      order.total_price
    );

    const payload = {
      transaction_details: {
        order_id: payment.id,
        gross_amount: order.total_price,
      },
      customer_details: {
        first_name: order.user.fullname ?? order.user.username,
        email: order.user.email,
      },
      callbacks: {
        finish: `${env.FRONTEND_PUBLIC_BASE_URL}/u/settings/purchase-history?order_id=${order.id}`,
      },
    };

    const snapResponse = await snap.createTransaction(payload as any);
    const snapResult = snapResponse as any;

    await PaymentRepository.updateById(payment.id, {
      snap_token: snapResult.token,
      snap_redirect_url: snapResult.redirect_url,
    });

    return {
      snap_token: snapResult.token,
      snap_redirect_url: snapResult.redirect_url,
    };
  }
}
