import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants";

const routerCategory = Router();

routerCategory.get("/", CategoryController.getCategories);
routerCategory.post(
  "/",
  verifyAccessToken,
  checkPermission([Permission.CREATE_CATEGORY]),
  CategoryController.addCategory
);
routerCategory.put(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_CATEGORY]),
  CategoryController.updateCategory
);
routerCategory.delete(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_CATEGORY]),
  CategoryController.deleteCategory
);

export default routerCategory;
