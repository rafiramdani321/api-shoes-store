import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { requireAuth } from "../middleware/requireAuth";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants/role-permission";

const routerCategory = Router();

routerCategory.get("/", CategoryController.getCategories);
routerCategory.get("/:id", CategoryController.getCategoryById);
routerCategory.post(
  "/",
  requireAuth,
  checkPermission([Permission.CREATE_CATEGORY]),
  CategoryController.addCategory
);
routerCategory.put(
  "/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_CATEGORY]),
  CategoryController.updateCategory
);
routerCategory.delete(
  "/delete-many",
  requireAuth,
  checkPermission([Permission.DELETE_CATEGORY]),
  CategoryController.deleteManyCategories
);
routerCategory.delete(
  "/:id",
  requireAuth,
  checkPermission([Permission.DELETE_CATEGORY]),
  CategoryController.deleteCategory
);

export default routerCategory;
