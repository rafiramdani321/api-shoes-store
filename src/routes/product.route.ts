import { Router } from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import ProductController from "../controllers/product.controller";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants";

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
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  upload.array("images"),
  ProductController.addProductImage
);

routerProduct.delete(
  "/images/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.deleteProductImageById
);

// Product sizes
routerProduct.post(
  "/product-sizes",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.addSizeAndStockProduct
);

routerProduct.put(
  "/product-sizes/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.updateSizeAndStockProduct
);

routerProduct.delete(
  "/product-sizes/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.deleteSizeProductById
);

// Bulk delete
routerProduct.delete(
  "/delete-many",
  verifyAccessToken,
  checkPermission([Permission.DELETE_PRODUCT]),
  ProductController.deleteManyProduct
);

// CRUD Product by ID
routerProduct.get("/:id", ProductController.getProductById);

routerProduct.post(
  "/",
  verifyAccessToken,
  checkPermission([Permission.CREATE_PRODUCT]),
  upload.array("images"),
  ProductController.addProduct
);

routerProduct.put(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_PRODUCT]),
  ProductController.updateProductById
);

routerProduct.delete(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_PRODUCT]),
  ProductController.deleteProduct
);

export default routerProduct;
