import { Request, Response } from "express";
import CartService from "../services/cart.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";

export default class CartController {
  static async getCartsByUserId(req: Request, res: Response) {
    const user = req.user;
    try {
      const response = await CartService.getCartsByUserId(user?.id!);
      return successResponse(
        res,
        "fetching carts by user success",
        200,
        response
      );
    } catch (error: any) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }
  static async addCart(req: Request, res: Response) {
    const user = req.user;
    const body = req.body;
    try {
      const payload = {
        ...body,
        user_id: user?.id!,
      };

      await CartService.addCart(payload);
      return successResponse(res, "Add cart success", 201);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async deleteCartItemById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await CartService.deleteCartItemById(id);
      return successResponse(res, "delete cart item success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }
}
