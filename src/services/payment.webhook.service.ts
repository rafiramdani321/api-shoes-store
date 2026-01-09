import { PaymentStatus, Prisma, StatusOrder } from "@prisma/client";
import { verifyMidtransSignature } from "../libs/midtransSignature";
import { prisma } from "../libs/prisma";
import { OrderRepository } from "../repositories/order.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { AppError } from "../utils/errors";

export class PaymentWebhookService {
  static async handleNotification(payload: any) {
    if (!verifyMidtransSignature(payload)) {
      throw new AppError("Invalid signature", 401);
    }

    const {
      order_id,
      transaction_id,
      transaction_status,
      payment_type,
      transaction_time,
    } = payload;

    const payment = await PaymentRepository.findById(order_id);
    if (!payment) return;

    if (payment.status === "SUCCESS") return;

    let paymentStatus: PaymentStatus;
    let orderStatus: StatusOrder;

    switch (transaction_status) {
      case "settlement":
      case "capture":
        paymentStatus = "SUCCESS";
        orderStatus = "PAID";
        break;
      case "pending":
        paymentStatus = "PENDING";
        orderStatus = "PENDING_PAYMENT";
        break;
      case "expire":
        paymentStatus = "EXPIRED";
        orderStatus = "PAYMENT_FAILED";
        break;

      default:
        paymentStatus = "FAILED";
        orderStatus = "PAYMENT_FAILED";
    }

    await prisma.$transaction(async (tx) => {
      await PaymentRepository.updateStatusByIdTx(tx, {
        id: payment.id,
        transaction_id,
        status: paymentStatus,
        payment_type,
        paid_at:
          paymentStatus === "SUCCESS" ? new Date(transaction_time) : null,
        raw_response: payload,
      });

      await OrderRepository.updateStatusByIdTx(tx, {
        id: payment.order_id,
        status: orderStatus,
        paid_at: orderStatus === "PAID" ? new Date(transaction_time) : null,
      });
    });
  }
}
