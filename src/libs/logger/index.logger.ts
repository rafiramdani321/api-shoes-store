import { createRotatingLogger } from "./create-rotating-logger";

export const cleanTokenLogger = createRotatingLogger("clean-tokens");
export const registerLogger = createRotatingLogger("register");
export const resendTokenVerifyLogger = createRotatingLogger(
  "resend-email-verify-token"
);
export const loginLogger = createRotatingLogger("login");

export const createCategoryLogger = createRotatingLogger("create-category");
export const updateCategoryLogger = createRotatingLogger("update-category");
export const deleteCategoryLogger = createRotatingLogger("delete-category");
export const deleteManyCategoryLogger = createRotatingLogger(
  "delete-many-categories"
);

export const createSubCategoryLogger =
  createRotatingLogger("create-subcategory");
export const updateSubcategoryLogger =
  createRotatingLogger("update-subcategory");
export const deleteSubCategoryLogger =
  createRotatingLogger("delete-subcategory");
export const deleteManySubcategoryLogger = createRotatingLogger(
  "delete-many-subcategories"
);

export const createSizeLogger = createRotatingLogger("create-size");
export const updateSizeLogger = createRotatingLogger("update-size");
export const deleteSizeLogger = createRotatingLogger("delete-size");
export const deleteManySizeLogger = createRotatingLogger("delete-many-size");

export const createRoleLogger = createRotatingLogger("create-role");
export const updateRoleLogger = createRotatingLogger("update-role");
export const deleteRoleLogger = createRotatingLogger("delete-role");
export const deleteManyRolesLogger = createRotatingLogger("delete-many-roles");
