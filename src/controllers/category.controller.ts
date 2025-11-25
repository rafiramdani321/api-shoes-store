import { NextFunction, Request, Response } from "express";
import { getClientInfo } from "../utils/getClientInfo";
import { errorResponse, handleSuccess } from "../utils/responses";
import CategoryService from "../services/category.service";
import {
  createCategoryLogger,
  deleteCategoryLogger,
  deleteManyCategoryLogger,
  updateCategoryLogger,
} from "../libs/logger/index.logger";
import { AppError } from "../utils/errors";
import { CategoryCreate, CategoryUpdate } from "../types/category.type";

export default class CategoryController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await CategoryService.getCategories(req.query);
      return handleSuccess(res, "Fetching categories success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    try {
      const response = await CategoryService.getCategoryById(id);
      return handleSuccess(
        res,
        "Fetcing category by id success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async addCategory(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;
    try {
      const newData: CategoryCreate = {
        name: data?.name,
        slug: data?.slug,
        created_by: req?.user?.email!,
      };
      await CategoryService.addCategory(newData);

      createCategoryLogger.info({
        event: "create_category_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Create new category success", 201);
    } catch (error: any) {
      createCategoryLogger.error({
        event: "create_category_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;
    try {
      const newData: CategoryUpdate = {
        id: id,
        name: data?.name,
        slug: data?.slug,
        updated_by: req?.user?.email!,
      };
      await CategoryService.updateCategory(newData);

      updateCategoryLogger.info({
        event: "update_category_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "Update category success", 200);
    } catch (error: any) {
      updateCategoryLogger.error({
        event: "update_category_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
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

      return handleSuccess(res, "Category deleted success", 200);
    } catch (error: any) {
      deleteCategoryLogger.error({
        event: "delete_category_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteManyCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      const response = await CategoryService.deleteManyCategory(req.body.ids);

      deleteManyCategoryLogger.info({
        event: "delete_categories_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return handleSuccess(res, "deleted categories success", 200, response);
    } catch (error: any) {
      deleteManyCategoryLogger.error({
        event: "delete_categories_failed",
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
