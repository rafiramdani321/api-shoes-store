import { prisma } from "../libs/prisma";
import { CreateCartType } from "../types/cart.type";

export default class CartRepository {
  static async findCartsByUserId(user_id: string) {
    return await prisma.cart.findUnique({
      where: { user_id },
      include: {
        CartItem: {
          include: {
            product: {
              include: {
                category: true,
                sub_category: true,
                ProductImage: true,
              },
            },
            product_size: {
              include: {
                size: true,
              },
            },
          },
        },
      },
    });
  }

  static async findCartItemByCartIdProductIdProductSizeId(
    cart_id: string,
    product_id: string,
    product_size_id: string
  ) {
    return await prisma.cartItem.findUnique({
      where: {
        cart_id_product_id_product_size_id: {
          cart_id,
          product_id,
          product_size_id,
        },
      },
    });
  }

  static async createCart(user_id: string) {
    return await prisma.cart.create({
      data: {
        user_id,
      },
    });
  }

  static async findCartItemById(id: string) {
    return await prisma.cartItem.findUnique({ where: { id } });
  }

  static async createCartItem(data: CreateCartType) {
    return await prisma.cartItem.create({
      data: {
        cart_id: data.cart_id,
        product_id: data.product_id,
        product_size_id: data.product_size_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.total_price,
      },
    });
  }

  static async deleteCartItemById(id: string) {
    return await prisma.cartItem.delete({ where: { id } });
  }
}
