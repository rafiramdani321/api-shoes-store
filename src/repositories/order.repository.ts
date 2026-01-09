import { Prisma, StatusOrder } from "@prisma/client";
import { prisma } from "../libs/prisma";

export class OrderRepository {
  static async createTx(
    tx: Prisma.TransactionClient,
    orderData: Prisma.OrderCreateInput,
    orderItemsData: {
      product_id: string;
      product_size_id: string;
      quantity: number;
      unit_price: number;
      product_title: string;
      product_image_url: string;
      product_size: string;
    }[]
  ) {
    return tx.order.create({
      data: {
        ...orderData,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });
  }

  static async findAll(userId: string) {
    return prisma.order.findMany({
      where: {
        user_id: userId,
      },
      include: {
        orderItems: true,
        payments: true,
      },
    });
  }

  static async findByIdAndUserId(id: string, userId: string) {
    return prisma.order.findFirst({
      where: {
        id,
        user_id: userId,
      },
      include: {
        user: true,
        orderItems: {
          orderBy: { created_at: "desc" },
        },
        payments: {
          orderBy: { created_at: "desc" },
        },
      },
    });
  }

  static async findByIdAndUserIdAndStatusPaymentPending(
    id: string,
    userId: string
  ) {
    return prisma.order.findFirst({
      where: {
        id,
        user_id: userId,
        status: "PENDING_PAYMENT",
      },
      include: {
        user: true,
        payments: {
          where: { status: "PENDING" },
          orderBy: { created_at: "desc" },
          take: 1,
        },
        orderItems: {
          orderBy: { created_at: "desc" },
        },
      },
    });
  }

  static async cancelOrderByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    id: string
  ) {
    return tx.order.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  }

  static async updateStatusByIdTx(
    tx: Prisma.TransactionClient,
    data: {
      id: string;
      status: StatusOrder;
      paid_at?: Date | null;
    }
  ) {
    return tx.order.update({
      where: { id: data.id },
      data: {
        status: data.status,
        paid_at: data.paid_at,
      },
    });
  }
}
