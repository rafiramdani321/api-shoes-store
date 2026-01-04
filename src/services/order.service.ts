import { prisma } from "../libs/prisma";
import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import ShippingAddressRepository from "../repositories/shippingAddress.repository";
import { CreateOrder } from "../types/order.type";
import { AppError } from "../utils/errors";
import UserService from "./user.service";

export class OrderService {
  static async getAll(userId: string) {
    const orders = await OrderRepository.findAll(userId);
    return orders;
  }

  static async getByIdAndUserId(id: string, userId: string) {
    if (!id) {
      throw new AppError("Order id is required.", 400);
    }

    const order = await OrderRepository.findByIdAndUserId(id, userId);
    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    return order;
  }

  static async cancelByIdAndUserId(id: string, userId: string) {
    if (!id) {
      throw new AppError("Order id is required.", 400);
    }
    const order = await this.getByIdAndUserId(id, userId);

    if (order.status !== "PENDING_PAYMENT") {
      throw new AppError("Order cannot be cancelled.", 409);
    }

    return prisma.$transaction(async (tx) => {
      const result = await OrderRepository.cancelOrderByIdAndUserIdTx(
        tx,
        order.id,
        userId
      );

      if (result.count === 0) {
        throw new AppError("Order cannot be cancelled.", 409);
      }

      for (const item of order.orderItems) {
        await ProductRepository.incrementStockByIdTx(
          tx,
          item.product_size_id,
          item.quantity
        );
      }

      return { success: true };
    });
  }

  static async createOrder(userId: string, payload: CreateOrder) {
    const { user_address_id, orderItems } = payload;

    if (!orderItems || orderItems.length === 0) {
      throw new AppError("Order items cannot be empty", 400);
    }

    return prisma.$transaction(async (tx) => {
      const address = await ShippingAddressRepository.findByIdAndUserIdTx(
        tx,
        user_address_id,
        userId
      );

      if (!address) {
        throw new AppError("Shipping address not found.", 404);
      }

      let totalPrice = 0;

      const orderItemsData: {
        product_id: string;
        product_size_id: string;
        quantity: number;
        unit_price: number;
        product_title: string;
        product_image_url: string;
        product_size: string;
      }[] = [];

      for (const item of orderItems) {
        if (item.quantity <= 0) {
          throw new AppError("Invalid quantity", 400);
        }

        const product = await ProductRepository.findByIdTx(tx, item.product_id);
        if (!product || !product.is_active) {
          throw new AppError("Product not available", 404);
        }

        const checkProductSize = product.ProductSize.find(
          (s) => s.id === item.product_size_id
        );
        if (!checkProductSize) {
          throw new AppError("Size this product not found.", 404);
        }

        const updateStock = await ProductRepository.decrementStockByIdTx(
          tx,
          item.product_size_id,
          item.quantity
        );
        if (updateStock.count === 0) {
          throw new AppError("Stock not sufficient.", 409);
        }

        const unitPrice = product.price;
        totalPrice += unitPrice * item.quantity;

        orderItemsData.push({
          product_id: item.product_id,
          product_size_id: item.product_size_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          product_title: product.title,
          product_image_url: product.ProductImage[0]?.url ?? null,
          product_size: checkProductSize.size.size,
        });
      }

      const order = await OrderRepository.createTx(
        tx,
        {
          user: { connect: { id: userId } },
          user_address: { connect: { id: user_address_id } },
          total_price: totalPrice,
          status: "PENDING_PAYMENT",
        },
        orderItemsData
      );

      return order;
    });
  }
}
