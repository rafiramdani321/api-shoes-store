import { Router } from "express";
import SubCategoriesController from "../controllers/subcategory.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { checkPermission } from "../middleware/checkPermission";
import { Permission } from "../constants";

const routerSubCategory = Router();

routerSubCategory.get("/", SubCategoriesController.getCategories);
routerSubCategory.get("/:id", SubCategoriesController.getCategoryById);
routerSubCategory.post(
  "/",
  verifyAccessToken,
  checkPermission([Permission.CREATE_SUB_CATEGORY]),
  SubCategoriesController.addSubCategory
);
routerSubCategory.put(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.UPDATE_SUB_CATEGORY]),
  SubCategoriesController.updateSubCategory
);
routerSubCategory.delete(
  "/delete-many",
  verifyAccessToken,
  checkPermission([Permission.DELETE_SUB_CATEGORY]),
  SubCategoriesController.deleteManySubCategories
);
routerSubCategory.delete(
  "/:id",
  verifyAccessToken,
  checkPermission([Permission.DELETE_SUB_CATEGORY]),
  SubCategoriesController.deleteSubCategory
);

export default routerSubCategory;
