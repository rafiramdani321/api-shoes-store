import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../libs/prisma";

export class PaymentRepository {
  static async create(order_id: string, provider: string, amount: number) {
    return prisma.payment.create({
      data: {
        order_id,
        provider,
        amount,
      },
    });
  }

  static async updateById(
    id: string,
    data: {
      snap_token: string;
      snap_redirect_url: string;
    }
  ) {
    return prisma.payment.update({
      where: { id },
      data: {
        snap_token: data.snap_token,
        snap_redirect_url: data.snap_redirect_url,
      },
    });
  }

  static async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  static async findByIdAndOrder(paymentId: string, orderId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId, order_id: orderId },
    });
  }

  static async findLatestPendingByOrderId(orderId: string) {
    return prisma.payment.findFirst({
      where: { order_id: orderId, status: "PENDING" },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  static async updateStatusByIdTx(
    tx: Prisma.TransactionClient,
    data: {
      id: string;
      status: PaymentStatus;
      payment_type?: string;
      paid_at?: Date | null;
      raw_response?: Prisma.InputJsonValue;
      transaction_id: string;
    }
  ) {
    return tx.payment.update({
      where: { id: data.id },
      data: {
        transaction_id: data.transaction_id,
        status: data.status,
        payment_type: data.payment_type,
        paid_at: data.paid_at,
        raw_response:
          data.raw_response !== undefined ? data.raw_response : undefined,
      },
    });
  }

  static async updateStatusToFailedByIdTx(
    tx: Prisma.TransactionClient,
    id: string,
    rawResponse: Prisma.InputJsonValue
  ) {
    return tx.payment.update({
      where: {
        id,
      },
      data: {
        status: "FAILED",
        raw_response: rawResponse,
      },
    });
  }
}
