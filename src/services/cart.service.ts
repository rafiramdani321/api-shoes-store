import CartRepository from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import UserRepository from "../repositories/user.repository";
import { CreateCartType } from "../types/cart.type";
import { AppError } from "../utils/errors";

export default class CartService {
  static async getCartsByUserId(user_id: string) {
    if (!user_id || user_id === "") {
      throw new AppError("User id is required", 404);
    }

    const user = await UserRepository.findUserById(user_id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return await CartRepository.findCartsByUserId(user.id);
  }

  static async getCartItemById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id cart item required.", 404);
    }

    const cartItem = await CartRepository.findCartItemById(id);
    if (!cartItem) {
      throw new AppError("Cart item not found.", 404);
    }

    return cartItem;
  }

  static async addCart(data: CreateCartType) {
    if (!data.user_id || data.user_id === "") {
      throw new AppError("id user required", 404);
    }

    const user = await UserRepository.findUserById(data.user_id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const product = await ProductRepository.findProductById(data.product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const sizeProduct = await ProductRepository.findSizeProductIdAndProductId(
      data.product_size_id,
      product.id
    );
    if (!sizeProduct) {
      throw new AppError("Size product not found", 404);
    }

    let cart_id;
    if (!user.Cart || (user.Cart && !user.Cart.id)) {
      const addCart = await CartRepository.createCart(user.id);
      if (!addCart.id) {
        throw new AppError("Cart id not found", 404);
      }
      cart_id = addCart.id;
    } else {
      cart_id = user.Cart.id;
    }

    const findCartItemDuplicate =
      await CartRepository.findCartItemByCartIdProductIdProductSizeId(
        cart_id,
        product.id,
        data.product_size_id
      );
    if (findCartItemDuplicate) {
      throw new AppError(
        "The same product and size are already in the cart",
        400
      );
    }

    const newData: CreateCartType = {
      ...data,
      cart_id,
      product_id: product.id,
      product_size_id: sizeProduct.id,
      quantity: Number(data.quantity),
      unit_price: Number(data.unit_price),
      total_price: Number(data.total_price),
    };

    return await CartRepository.createCartItem(newData);
  }

  static async deleteCartItemById(id: string) {
    const cartItem_id = await this.getCartItemById(id);
    return await CartRepository.deleteCartItemById(cartItem_id.id);
  }
}
