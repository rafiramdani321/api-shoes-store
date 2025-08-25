import { Request, Response } from "express";
import SizeService from "../services/size.service";
import { errorResponse, successResponse } from "../utils/responses";
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
  static async getSizes(req: Request, res: Response) {
    try {
      const response = await SizeService.getSizes(req.query);
      return successResponse(res, "Fetching size success", 200, response);
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async getSizeById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await SizeService.getSizeById(id);
      return successResponse(res, "Fetcing size by id success", 200, response);
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async addSize(req: Request, res: Response) {
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

      return successResponse(res, "Create new size success", 201);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      createSizeLogger.error({
        event: "create_size_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async updateSize(req: Request, res: Response) {
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

      return successResponse(res, "Update size success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateSizeLogger.error({
        event: "update_size_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async deleteSizeById(req: Request, res: Response) {
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

      return successResponse(res, "Size deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteSizeLogger.error({
        event: "delete_size_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async deleteManySizeByIds(req: Request, res: Response) {
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

      return successResponse(res, "deleted sizes success", 200, response);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteManySizeLogger.error({
        event: "delete_sizes_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error.",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }
}
