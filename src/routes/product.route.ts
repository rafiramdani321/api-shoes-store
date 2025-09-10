import { Router } from "express";
import multer from "multer";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import ProductController from "../controllers/product.controller";

const routerProduct = Router();
const upload = multer({ storage: multer.memoryStorage() });

routerProduct.post(
  "/",
  verifyAccessToken,
  upload.array("images"),
  ProductController.addProduct
);

export default routerProduct;
