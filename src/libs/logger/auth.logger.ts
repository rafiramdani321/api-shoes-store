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
