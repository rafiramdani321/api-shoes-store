import { Request, Response } from "express";
import { uploadFilesToUploadThing } from "../utils/uploadthing";
import { CreateProductType } from "../types/product.type";
import { ProductService } from "../services/product.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";

export default class ProductController {
  static async addProduct(req: Request, res: Response) {
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

      return successResponse(res, "Product created success", 201, {
        data: newProduct,
      });
    } catch (error: any) {
      console.log(error);
      const isKnownError = error instanceof AppError;
      return errorResponse(
        res,
        isKnownError ? error.message : "Internal server error",
        isKnownError ? error.statusCode : 500,
        isKnownError ? error.details : undefined
      );
    }
  }
}
