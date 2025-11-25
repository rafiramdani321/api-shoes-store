import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";
import { errorResponse, handleSuccess } from "../utils/responses";
import CartService from "../services/cart.service";

export default class CartController {
  static async getCartsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user || !user.user_id) {
        throw new AppError("Unauthorized: missing user data.", 401);
      }
      const response = await CartService.getByUserId(user.user_id);
      return handleSuccess(
        res,
        "fetching carts by user success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }
  static async addCart(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const user = req.user;

      if (!user || !user.user_id) {
        throw new AppError("Unathorized: missing user data.", 401);
      }

      const payload = {
        ...body,
        user_id: user.user_id,
      };

      await CartService.addCart(payload);
      return handleSuccess(res, "Add cart success", 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteCartItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    try {
      await CartService.deleteCartItemById(id);
      return handleSuccess(res, "delete cart item success", 200);
    } catch (error: any) {
      next(error);
    }
  }
}
