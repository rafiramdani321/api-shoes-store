import slugify from "slugify";
import { ProductRepository } from "../repositories/product.repository";
import {
  CreateProductImageType,
  CreateProductType,
  createSizeProductType,
  GetProductQueryBase,
  ProductsAllowedSearchBy,
  ProductsAllowedSortBy,
  ProductsSortOrder,
  UpdateProductType,
  updateSizeProductType,
} from "../types/product.type";
import { AppError } from "../utils/errors";
import {
  deleteFileFromUploadthingByFileId,
  deleteFilesFromUploadthing,
  uploadFilesToUploadThing,
} from "../utils/uploadthing";
import { validationResponses } from "../validations/index.validation";
import {
  createProductValidation,
  createProductSizesValidation,
  updateProductSizeValidation,
  updateProductValidation,
} from "../validations/validation-schema";

export class ProductService {
  static async getProducts(query: GetProductQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;

    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;
    const search = query.search?.toString();

    const allowedSearchBy: ProductsAllowedSearchBy[] = [
      "title",
      "slug",
      "category",
      "sub_category",
    ];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as ProductsAllowedSearchBy
    )
      ? (query.searchBy as ProductsAllowedSearchBy)
      : undefined;

    const allowedSortBy: ProductsAllowedSortBy[] = [
      "title",
      "slug",
      "price",
      "category",
      "sub_category",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(query.sortBy as ProductsAllowedSortBy)
      ? (query.sortBy as ProductsAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: ProductsSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await ProductRepository.findProducts(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getProductById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id product required", 404);
    }

    const product = await ProductRepository.findProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  static async getProductBySlug(slug: string) {
    if (!slug || slug === "") {
      throw new AppError("Slug is required", 404);
    }

    const product = await ProductRepository.findProductBySlug(slug);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

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
    const errorsValidation = createProductValidation.safeParse(data);
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
      subcategory_id: data.subcategory_id === "" ? null : data.subcategory_id,
      images: uploadImages.map((img) => ({ url: img.url, fileId: img.fileId })),
      sizes: data.sizes.map((s) => ({
        size_id: s.size_id,
        stock: s.stock,
      })),
    };

    return await ProductRepository.createProduct(newProduct);
  }

  static async updateProductById(data: UpdateProductType) {
    const errorValidation = updateProductValidation.safeParse(data);
    if (!errorValidation.success) {
      const errors = validationResponses(errorValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const product = await ProductRepository.findProductById(data.id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const dbErrors: { field: keyof UpdateProductType; message: string }[] = [];

    const existingTitle = await ProductRepository.findProductByTitle(
      data.title
    );
    if (existingTitle && existingTitle.id !== data.id) {
      dbErrors.push({ field: "title", message: "Title already exist." });
    }

    const existingSlug = await ProductRepository.findProductBySlug(
      data.slug.toLowerCase()
    );
    if (existingSlug && existingSlug.id !== data.id) {
      dbErrors.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const updateData: UpdateProductType = {
      ...data,
      slug: slugify(data.slug, { lower: true }),
      price: Number(data.price),
    };

    return await ProductRepository.updateProduct(updateData);
  }

  static async deleteProductById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id product not found", 404);
    }

    const product = await ProductRepository.findProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const fileIds = product.ProductImage.map((i) => i.fileId);
    if (fileIds.length > 0) {
      await deleteFilesFromUploadthing(fileIds);
    }

    return await ProductRepository.deleteProductById(id);
  }

  static async deleteManyProducts(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data products not found", 404);
    }

    const products = await ProductRepository.findProductsByIds(ids);
    if (!products || products.length === 0) {
      throw new AppError("Products not found", 404);
    }

    const fileIds = products.flatMap((p) =>
      p.ProductImage.map((img) => img.fileId)
    );

    if (fileIds.length > 0) {
      await deleteFilesFromUploadthing(fileIds);
    }

    return await ProductRepository.deleteManyProducts(ids);
  }

  static async addProductImages(data: {
    product_id: string;
    files: Express.Multer.File[];
  }) {
    if (!data.product_id || data.product_id === "") {
      throw new AppError("Id product requried.", 404);
    }

    const product = await ProductRepository.findProductById(data.product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (data.files.length < 0) {
      throw new AppError("Images not found", 404);
    }

    if (data.files.length + product.ProductImage.length > 5) {
      throw new AppError("Maximum 5 images to uploads.", 400);
    }

    if (data.files.some((file) => file.size > 4 * 1024 * 1024)) {
      throw new AppError("Each image must be <= 4MB", 400);
    }

    if (
      data.files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
      )
    ) {
      throw new AppError("Only JPG, PNG, WEBP allowed", 400);
    }

    const uploadImges = await uploadFilesToUploadThing(data.files);
    const newImagesProduct: CreateProductImageType = {
      product_id: data.product_id,
      images: uploadImges.map((img) => ({ url: img.url, fileId: img.fileId })),
    };

    return await ProductRepository.createProductImagesByProductId(
      newImagesProduct
    );
  }

  static async deleteImageProductById(id: string) {
    if (!id || id === "") {
      throw new AppError("ID Image product required.", 404);
    }

    const image = await ProductRepository.findProductImageById(id);
    if (!image) {
      throw new AppError("Image product not found", 404);
    }

    const productImages = await ProductRepository.findAllImagesByProductId(
      image.product_id
    );
    if (productImages.length === 1) {
      throw new AppError(
        "You cannot delete this image, because this product image has at least one image."
      );
    }

    const deleteFromUploadthing = await deleteFileFromUploadthingByFileId(
      image.fileId
    );
    if (!deleteFromUploadthing.success) {
      throw new AppError("Something went wrong", 400);
    }

    return await ProductRepository.deleteImageProductByFileId(id);
  }

  static async addProductSizes(data: createSizeProductType) {
    if (!data.product_id || data.product_id === "") {
      throw new AppError("Id Product is required.", 404);
    }

    const errorValidation = createProductSizesValidation.safeParse(data);
    if (!errorValidation.success) {
      const errors = await validationResponses(errorValidation);
      throw new AppError("validation failed", 400, errors);
    }

    const product = await ProductRepository.findProductById(data.product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existSize = await ProductRepository.findSizesIdsByProducyId(
      data.product_id,
      data.sizes.map((s) => s.size_id)
    );

    if (existSize.length > 0) {
      throw new AppError("Some sizes already exist for this product", 400);
    }

    return await ProductRepository.createSizeAndStockByProductId(data);
  }

  static async updateSizeProductById(data: updateSizeProductType) {
    const errorsValidation = updateProductSizeValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }
    const size = await ProductRepository.findSizeProductById(data.id);
    if (!size) {
      throw new AppError("Size product not found", 404);
    }

    const existingSize = await ProductRepository.findSizeIdAndProductId(
      size.product_id,
      data.size_id
    );

    if (existingSize && existingSize.id !== data.id) {
      throw new AppError("Size product already exist", 400);
    }

    return await ProductRepository.updateSizeAndStockById(data);
  }

  static async deleteSizeProductById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id Size product is required", 404);
    }

    const sizeProduct = await ProductRepository.findSizeProductById(id);
    if (!sizeProduct) {
      throw new AppError("Product size not found", 404);
    }

    const sizeProductByProductId =
      await ProductRepository.findAllSizeProductByProductId(
        sizeProduct.product_id
      );

    if (sizeProductByProductId.length === 1) {
      throw new AppError(
        "You cannot delete this size, because this product size has at least one size.",
        400
      );
    }

    return await ProductRepository.deleteSizeProductById(id);
  }
}
