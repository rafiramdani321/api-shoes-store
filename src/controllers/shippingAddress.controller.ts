import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import ShippingAddressService from "../services/shippingAddress.service";
import { handleSuccess } from "../utils/responses";

export default class ShippingAddressController {
  static async getShippingAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await ShippingAddressService.getShippingAddress(
        user.user_id
      );
      return handleSuccess(
        res,
        "Fething shipping address success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async getShippingAddressByIdAndUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const { id } = req.params;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      const response = await ShippingAddressService.getByIdAndUserId(
        id,
        user.user_id
      );
      return handleSuccess(
        res,
        "Fething shipping address by id success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async addShippingAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const body = req.body;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      await ShippingAddressService.addShippingAddress({
        ...body,
        user_id: user.user_id,
      });

      return handleSuccess(res, "Add shipping address success.", 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateShippingAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const body = req.body;
    const { id } = req.params;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      await ShippingAddressService.updateShippingAddress({
        ...body,
        user_id: user.user_id,
        id,
      });

      return handleSuccess(res, "Update shipping address success.", 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteShippingAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = req.user;
    const { id } = req.params;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      await ShippingAddressService.deleteShippingAddress(id, user.user_id);

      return handleSuccess(res, "Deleting shipping address success.", 200);
    } catch (error: any) {
      next(error);
    }
  }

  static async setIsPrimary(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { id } = req.params;
    try {
      if (!user?.user_id) {
        throw new AppError("Unauthorized.", 401);
      }

      await ShippingAddressService.setIsPrimary(id, user.user_id);

      return handleSuccess(res, "Primary address updated successfully.", 200);
    } catch (error: any) {
      next(error);
    }
  }
}
