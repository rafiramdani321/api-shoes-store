import { NextFunction, Request, Response } from "express";
import SizeService from "../services/size.service";
import { errorResponse, handleSuccess } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import { SizeCreateType, SizeUpdateType } from "../types/size.type";
import {
  createSizeLogger,
  deleteManySizeLogger,
  deleteSizeLogger,
  updateSizeLogger,
} from "../libs/logger/index.logger";

export default class SizeController {
  static async getSizes(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await SizeService.getSizes(req.query);
      return handleSuccess(res, "Fetching size success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getSizeById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const response = await SizeService.getSizeById(id);
      return handleSuccess(res, "Fetcing size by id success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async addSize(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;
    try {
      const newData: SizeCreateType = {
        size: data?.size,
        created_by: req.user?.email!,
      };
      await SizeService.addSize(newData);

      createSizeLogger.info({
        event: "create_size_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Create new size success", 201);
    } catch (error: any) {
      createSizeLogger.error({
        event: "create_size_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateSize(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;
    try {
      const newData: SizeUpdateType = {
        id: id,
        size: data?.size,
        updated_by: req.user?.email!,
      };
      await SizeService.updateSizeById(newData);

      updateSizeLogger.info({
        event: "update_size_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Update size success", 200);
    } catch (error: any) {
      updateSizeLogger.error({
        event: "update_size_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteSizeById(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await SizeService.deleteSizeById(id);

      deleteSizeLogger.info({
        event: "delete_size_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Size deleted success", 200);
    } catch (error: any) {
      deleteSizeLogger.error({
        event: "delete_size_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteManySizeByIds(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      const response = await SizeService.deleteManySizeByIds(req.body.ids);

      deleteManySizeLogger.info({
        event: "delete_sizes_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "deleted sizes success", 200, response);
    } catch (error: any) {
      deleteManySizeLogger.error({
        event: "delete_sizes_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }
}
