import { Request, Response } from "express";
import SubCategoriesService from "../services/subcategory.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import {
  SubCategoryCreate,
  SubCategoryUpdate,
} from "../types/sub-category.type";
import {
  createSubCategoryLogger,
  deleteManySubcategoryLogger,
  deleteSubCategoryLogger,
  updateSubcategoryLogger,
} from "../libs/logger/index.logger";

export default class SubCategoriesController {
  static async getCategories(req: Request, res: Response) {
    try {
      const response = await SubCategoriesService.getSubCategories(req.query);
      return successResponse(
        res,
        "Fetching sub categories success",
        200,
        response
      );
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await SubCategoriesService.getSubCategoryById(id);
      return successResponse(
        res,
        "Fetching sub category by id success",
        200,
        response
      );
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async addSubCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;
    const user = req.user;

    try {
      const newData: SubCategoryCreate = {
        name: data?.name,
        slug: data?.slug,
        category_id: data?.category_id,
        created_by: req?.user?.email!,
      };

      await SubCategoriesService.createSubCategory(newData);

      createSubCategoryLogger.info({
        event: "create_subcategory_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Create new sub category success", 201);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      createSubCategoryLogger.error({
        event: "create_subcategory_failed",
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

  static async updateSubCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;

    try {
      const newData: SubCategoryUpdate = {
        id,
        name: data?.name,
        slug: data?.slug,
        category_id: data?.category_id,
        updated_by: req?.user?.email!,
      };

      await SubCategoriesService.updateSubCategory(newData);
      updateSubcategoryLogger.info({
        event: "update_subcategory_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Update sub category succcess", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateSubcategoryLogger.error({
        event: "update_subcategory_failed",
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

  static async deleteSubCategory(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await SubCategoriesService.deleteSubCategory(id);

      deleteSubCategoryLogger.info({
        event: "delete_subcategory_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Sub Category deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteSubCategoryLogger.error({
        event: "update_subcategory_failed",
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

  static async deleteManySubCategories(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      const response = await SubCategoriesService.deleteManySubCategory(
        req.body.ids
      );

      deleteManySubcategoryLogger.info({
        event: "delete_many_subcategories_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(
        res,
        "deleted sub categories success",
        200,
        response
      );
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteManySubcategoryLogger.error({
        event: "delete_many_subcategories_failed",
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
