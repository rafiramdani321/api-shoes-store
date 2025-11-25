import { Router } from "express";
import SubCategoriesController from "../controllers/subcategory.controller";
import { requireAuth } from "../middleware/requireAuth";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants/role-permission";

const routerSubCategory = Router();

routerSubCategory.get("/", SubCategoriesController.getCategories);
routerSubCategory.get("/:id", SubCategoriesController.getCategoryById);
routerSubCategory.post(
  "/",
  requireAuth,
  checkPermission([Permission.CREATE_SUB_CATEGORY]),
  SubCategoriesController.addSubCategory
);
routerSubCategory.put(
  "/:id",
  requireAuth,
  checkPermission([Permission.UPDATE_SUB_CATEGORY]),
  SubCategoriesController.updateSubCategory
);
routerSubCategory.delete(
  "/delete-many",
  requireAuth,
  checkPermission([Permission.DELETE_SUB_CATEGORY]),
  SubCategoriesController.deleteManySubCategories
);
routerSubCategory.delete(
  "/:id",
  requireAuth,
  checkPermission([Permission.DELETE_SUB_CATEGORY]),
  SubCategoriesController.deleteSubCategory
);

export default routerSubCategory;
