import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import {
  createProductLogger,
  deleteManyProductsLogger,
  deleteProductLogger,
  updateProductLogger,
} from "../libs/logger/index.logger";
import { getClientInfo } from "../utils/getClientInfo";
import { UpdateProductType } from "../types/product.type";

export default class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const response = await ProductService.getProducts(req.query);
      return successResponse(res, "Fetching products success", 200, response);
    } catch (error) {
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async getProductById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await ProductService.getProductById(id);
      return successResponse(
        res,
        "Fetching product by id success",
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

  static async addProduct(req: Request, res: Response) {
    const { userAgent, ip } = getClientInfo(req);
    const files = req.files as Express.Multer.File[];
    const body = req.body;
    const user = req.user;
    try {
      const productData = {
        title: body.title,
        slug: body.slug,
        description: body.description,
        price: parseInt(body.price),
        is_active: body.is_active === "true" ? true : false,
        category_id: body.category_id,
        subcategory_id: body.subcategory_id,
        sizes: JSON.parse(body.sizes),
        created_by: user?.email!,
        files: files,
      };

      const newProduct = await ProductService.addProduct(productData);

      createProductLogger.info({
        event: "create_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product created success", 201, {
        data: newProduct,
      });
    } catch (error: any) {
      console.log(error);
      const isKnownError = error instanceof AppError;
      createProductLogger.error({
        event: "create_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }

  static async updateProductById(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const data = req.body;
    const { id } = req.params;
    try {
      const newData: UpdateProductType = {
        id: id,
        title: data?.title,
        slug: data?.slug,
        description: data?.description,
        price: Number(data?.price),
        category_id: data?.category_id,
        subcategory_id: data?.subcategory_id,
        is_active: data?.is_active,
        updated_by: req?.user?.email!,
      };
      await ProductService.updateProductById(newData);

      updateProductLogger.info({
        event: "update_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Update product success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "update_product_failed",
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

  static async deleteProduct(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await ProductService.deleteProductById(id);

      deleteProductLogger.info({
        event: "delete_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteProductLogger.error({
        event: "delete_product_failed",
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

  static async deleteManyProduct(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      await ProductService.deleteManyProducts(req.body.ids);

      deleteManyProductsLogger.info({
        event: "delete_many_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Products deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      deleteManyProductsLogger.error({
        event: "delete_many_product_failed",
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

  static async addProductImage(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const files = req.files as Express.Multer.File[];
    const { product_id } = req.body;
    try {
      const newProductImage = {
        product_id,
        files,
      };

      await ProductService.addProductImages(newProductImage);

      updateProductLogger.info({
        event: "add_image_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product image added success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "add_image_product_failed",
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

  static async deleteProductImageById(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await ProductService.deleteImageProductById(id);

      updateProductLogger.info({
        event: "delete_image_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product image deleted success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "delete_image_product_failed",
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

  static async addSizeAndStockProduct(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    try {
      await ProductService.addProductSizes(req.body);

      updateProductLogger.info({
        event: "add_size_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product sizes added success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "add_size_product_failed",
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

  static async updateSizeAndStockProduct(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const body = req.body;
    const { id } = req.params;
    try {
      const payload = {
        id,
        size_id: body.size_id,
        stock: body.stock,
      };
      await ProductService.updateSizeProductById(payload);

      updateProductLogger.info({
        event: "update_size_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Product sizes updated success", 200);
    } catch (error: any) {
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "update_size_product_failed",
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

  static async deleteSizeProductById(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const user = req.user;
    const { id } = req.params;
    try {
      await ProductService.deleteSizeProductById(id);

      updateProductLogger.info({
        event: "delete_size_product_success",
        email: user?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Delete size product success", 200);
    } catch (error: any) {
      console.log(error);
      const isKnownError = error instanceof AppError;

      updateProductLogger.error({
        event: "delete_size_product_failed",
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
