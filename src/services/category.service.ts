import CategoryRepository from "../repositories/category.repository";
import { CategoryCreate, CategoryUpdate } from "../types/category.type";
import { AppError } from "../utils/errors";
import { addOrUpdateCategoryValidation } from "../validations/category.validation";
import { validationResponses } from "../validations/index.validation";

export default class CategoryService {
  static async getCategories() {
    const categories = await CategoryRepository.findCategories();
    return categories;
  }

  static async addCategory(data: CategoryCreate) {
    const errorsValidation = addOrUpdateCategoryValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof CategoryCreate; message: string }[] = [];

    const existingName = await CategoryRepository.findCategoryByName(data.name);
    if (existingName) {
      dbErrors.push({ field: "name", message: "Category name already exist." });
    }

    const existingSlug = await CategoryRepository.findCategoryBySlug(data.slug);
    if (existingSlug) {
      dbErrors.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const category = await CategoryRepository.createCategory(data);
    return category;
  }

  static async updateCategory(data: CategoryUpdate) {
    const errorsValidation = addOrUpdateCategoryValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof CategoryUpdate; message: string }[] = [];

    const category = await CategoryRepository.findCategoryById(data.id);
    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    const existingName = await CategoryRepository.findCategoryByName(data.name);
    if (existingName && existingName.id !== data.id) {
      dbErrors.push({ field: "name", message: "Category name already exist." });
    }

    const existingSlug = await CategoryRepository.findCategoryBySlug(data.slug);
    if (existingSlug && existingSlug.id !== data.id) {
      dbErrors.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const update = await CategoryRepository.updateCategoryById(data);
    return update;
  }

  static async deleteCategory(id: string) {
    if (!id || id === null || id === "") {
      throw new AppError("id category not found.", 404);
    }

    const category = await CategoryRepository.findCategoryById(id);
    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    const deleteCategory = await CategoryRepository.deleteCategoryById(id);
    return deleteCategory;
  }
}
