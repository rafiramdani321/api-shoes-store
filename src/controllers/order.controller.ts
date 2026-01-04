import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { OrderService } from "../services/order.service";
import { handleSuccess } from "../utils/responses";

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.user_id;
    const { user_address_id, orderItems } = req.body;
    try {
      if (!userId) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await OrderService.createOrder(userId, {
        user_address_id,
        orderItems,
      });

      return handleSuccess(res, "Order created successfully.", 201, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.user_id;
    try {
      if (!userId) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await OrderService.getAll(userId);

      return handleSuccess(res, "Fetchind data success.", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.user_id;
    const { id } = req.params;
    try {
      if (!userId) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await OrderService.getByIdAndUserId(id, userId);

      return handleSuccess(res, "Fetching data success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async cancelById(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.user_id;
    const { id } = req.params;
    try {
      if (!userId) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await OrderService.cancelByIdAndUserId(id, userId);

      return handleSuccess(res, "Cancel order successfully", 200, response);
    } catch (error: any) {
      next(error);
    }
  }
}
