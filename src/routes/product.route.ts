import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import ProductController from "../controllers/product.controller";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants/role-permission";

const routerProduct = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
routerProduct.get("/", ProductController.getProducts);
routerProduct.get("/category", ProductController.getProductsByCategorySlug);
routerProduct.get(
  "/sub-category",
  ProductController.getProductsBySubCategorySlug
);
routerProduct.get("/slug/:slug", ProductController.getProductBySlug);

// Product images
routerProduct.post(
  "/images",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  upload.array("images"),
  ProductController.addProductImage
);

routerProduct.delete(
  "/images/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.deleteProductImageById
);

// Product sizes
routerProduct.post(
  "/product-sizes",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.addSizeAndStockProduct
);

routerProduct.put(
  "/product-sizes/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.updateSizeAndStockProduct
);

routerProduct.delete(
  "/product-sizes/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.deleteSizeProductById
);

// Bulk delete
routerProduct.delete(
  "/delete-many",
  requireAuth,
  checkPermission([Permission.DELETE_PRODUCT]),
  ProductController.deleteManyProduct
);

// CRUD Product by ID
routerProduct.get("/:id", ProductController.getProductById);

routerProduct.post(
  "/",
  requireAuth,
  checkPermission([Permission.CREATE_PRODUCT]),
  upload.array("images"),
  ProductController.addProduct
);

routerProduct.put(
  "/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.updateProductById
);

routerProduct.delete(
  "/:id",
  requireAuth,
  checkPermission([Permission.DELETE_PRODUCT]),
  ProductController.deleteProduct
);

export default routerProduct;
