import { Request, Response } from "express";
import { getClientInfo } from "../utils/getClientInfo";
import { errorResponse, successResponse } from "../utils/responses";
import CategoryService from "../services/category.service";
import {
  createCategoryLogger,
  deleteCategoryLogger,
  updateCategoryLogger,
} from "../libs/logger/auth.logger";
import { AppError } from "../utils/errors";
import { CategoryCreate, CategoryUpdate } from "../types/category.type";

export default class CategoryController {
  static async getCategories(req: Request, res: Response) {
    try {
      const response = await CategoryService.getCategories();
      return successResponse(res, "Fetcing categories success", 200, response);
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

  static async addCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;
    try {
      const newData: CategoryCreate = {
        name: data.name,
        slug: data.slug,
        created_by: req.user?.email!,
      };
      await CategoryService.addCategory(newData);

      createCategoryLogger.info({
        event: "create_category_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Create new category success", 201);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      createCategoryLogger.error({
        event: "create_category_failed",
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

  static async updateCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;
    try {
      const newData: CategoryUpdate = {
        id: id,
        name: data.name,
        slug: data.slug,
        updated_by: req.user?.email!,
      };
      await CategoryService.updateCategory(newData);

      updateCategoryLogger.info({
        event: "update_category_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Update category success", 200);
    } catch (error: any) {
      console.log(error);
      const isKnownError = error instanceof AppError;

      createCategoryLogger.error({
        event: "update_category_failed",
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

  static async deleteCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await CategoryService.deleteCategory(id);

      deleteCategoryLogger.info({
        event: "delete_category_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Category deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteCategoryLogger.error({
        event: "update_category_failed",
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
