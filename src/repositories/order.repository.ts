import { Prisma } from "@prisma/client";
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
        orderItems: true,
      },
    });
  }

  static async cancelOrderByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    id: string,
    userId: string
  ) {
    return tx.order.updateMany({
      where: {
        id,
        user_id: userId,
        status: "PENDING_PAYMENT",
      },
      data: {
        status: "CANCELLED",
      },
    });
  }
}
