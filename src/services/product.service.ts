import slugify from "slugify";
import { ProductRepository } from "../repositories/product.repository";
import { CreateProductType } from "../types/product.type";
import { AppError } from "../utils/errors";
import { uploadFilesToUploadThing } from "../utils/uploadthing";
import { validationResponses } from "../validations/index.validation";
import { createOrUpdateProduct } from "../validations/validation-schema";

export class ProductService {
  static async addProduct(data: {
    title: string;
    slug: string;
    description: string;
    price: number;
    is_active: boolean;
    category_id: string;
    subcategory_id: string;
    sizes: {
      size_id: string;
      stock: number;
    }[];
    created_by: string;
    files: Express.Multer.File[];
  }) {
    const errorsValidation = createOrUpdateProduct.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const errors: { field: keyof CreateProductType; message: string }[] = [];

    if (data.price <= 0) {
      errors.push({ field: "price", message: "Price must be greater than 0" });
    }

    if (data.files.length > 5) {
      errors.push({ field: "images", message: "Maximum 5 images" });
    }

    if (data.files.some((file) => file.size > 4 * 1024 * 1024)) {
      errors.push({ field: "images", message: "Each image must be <= 4MB" });
    }

    if (
      data.files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
      )
    ) {
      errors.push({ field: "images", message: "Only JPG, PNG, WEBP allowed" });
    }

    const existingTitle = await ProductRepository.findProductByTitle(
      data.title
    );
    if (existingTitle) {
      errors.push({ field: "title", message: "Title already exist" });
    }

    const existingSlug = await ProductRepository.findProductBySlug(
      data.slug.toLowerCase()
    );
    if (existingSlug) {
      errors.push({ field: "slug", message: "Slug already exist" });
    }

    if (errors.length > 0) {
      throw new AppError("Validation failed", 400, errors);
    }

    const uploadImages = await uploadFilesToUploadThing(data.files);

    const newProduct: CreateProductType = {
      ...data,
      slug: slugify(data.slug, { lower: true }),
      images: uploadImages.map((img) => ({ url: img.url, fileId: img.fileId })),
      sizes: data.sizes.map((s) => ({
        size_id: s.size_id,
        stock: s.stock,
      })),
    };

    return ProductRepository.createProduct(newProduct);
  }
}
