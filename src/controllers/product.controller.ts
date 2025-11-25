import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { errorResponse, handleSuccess } from "../utils/responses";
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
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ProductService.getProducts(req.query);
      return handleSuccess(res, "Fetching products success", 200, response);
    } catch (error: any) {
      next(error);
    }
  }

  static async getProductsByCategorySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let sizes: string[] | undefined = undefined;

      if (req.query.sizes) {
        sizes = Array.isArray(req.query.sizes)
          ? req.query.sizes.map((s) => String(s))
          : [String(req.query.sizes)];
      }

      const query = {
        category_slug: String(req.query.category_slug),
        page: String(req.query.page),
        limit: String(req.query.limit),
        search: req.query.search ? String(req.query.search) : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder
          ? String(req.query.sortOrder)
          : undefined,
        minPrice: req.query.minPrice ? String(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? String(req.query.maxPrice) : undefined,
        sizes,
      };
      const response = await ProductService.getProductsByCategorySlug(query);
      return handleSuccess(
        res,
        "Fetching products by category success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async getProductsBySubCategorySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let sizes: string[] | undefined = undefined;

      if (req.query.sizes) {
        sizes = Array.isArray(req.query.sizes)
          ? req.query.sizes.map((s) => String(s))
          : [String(req.query.sizes)];
      }

      const query = {
        category_slug: String(req.query.category_slug),
        subcategory_slug: String(req.query.subcategory_slug),
        page: String(req.query.page),
        limit: String(req.query.limit),
        search: req.query.search ? String(req.query.search) : undefined,
        sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
        sortOrder: req.query.sortOrder
          ? String(req.query.sortOrder)
          : undefined,
        minPrice: req.query.minPrice ? String(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? String(req.query.maxPrice) : undefined,
        sizes,
      };
      const response = await ProductService.getProductsBySubCategorySlug(query);
      return handleSuccess(
        res,
        "Fetching products by sub category success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const response = await ProductService.getProductById(id);
      return handleSuccess(
        res,
        "Fetching product by id success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async getProductBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { slug } = req.params;
    try {
      const response = await ProductService.getProductBySlug(slug);
      return handleSuccess(
        res,
        "Fetching product by slug success",
        200,
        response
      );
    } catch (error: any) {
      next(error);
    }
  }

  static async addProduct(req: Request, res: Response, next: NextFunction) {
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

      return handleSuccess(res, "Product created success", 201, {
        data: newProduct,
      });
    } catch (error: any) {
      createProductLogger.error({
        event: "create_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Update product success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "update_product_failed",
        email: data?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
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

      return handleSuccess(res, "Product deleted success", 200);
    } catch (error: any) {
      deleteProductLogger.error({
        event: "delete_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteManyProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Products deleted success", 200);
    } catch (error: any) {
      deleteManyProductsLogger.error({
        event: "delete_many_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async addProductImage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Product image added success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "add_image_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteProductImageById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Product image deleted success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "delete_image_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async addSizeAndStockProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Product sizes added success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "add_size_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async updateSizeAndStockProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Product sizes updated success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "update_size_product_failed",
        email: user?.email || "unknown",
        message: error.message,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      next(error);
    }
  }

  static async deleteSizeProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

      return handleSuccess(res, "Delete size product success", 200);
    } catch (error: any) {
      updateProductLogger.error({
        event: "delete_size_product_failed",
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
