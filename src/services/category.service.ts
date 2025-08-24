import slugify from "slugify";

import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import { addOrUpdateCategoryValidation } from "../validations/category.validation";
import CategoryRepository from "../repositories/category.repository";
import {
  CategoriesAllowedSearchBy,
  CategoriesAllowedSortBy,
  CategoryCreate,
  CategoryUpdate,
  GetCategoriesQueryBase,
  CategoriesSortOrder,
} from "../types/category.type";

export default class CategoryService {
  static async getCategories(query: GetCategoriesQueryBase) {
    const page = Math.max(parseInt(query.page ?? "1"), 1);
    const limit = Math.max(parseInt(query.limit ?? "10"), 1);
    const search = query.search?.toString();

    const allowedSearchBy: CategoriesAllowedSearchBy[] = ["name", "slug"];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as CategoriesAllowedSearchBy
    )
      ? (query.searchBy as CategoriesAllowedSearchBy)
      : undefined;

    const allowedSortBy: CategoriesAllowedSortBy[] = [
      "name",
      "slug",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(
      query.sortBy as CategoriesAllowedSortBy
    )
      ? (query.sortBy as CategoriesAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: CategoriesSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await CategoryRepository.findCategories(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getCategoryById(id: string) {
    if (!id || id === null || id === "") {
      throw new AppError("Id requried");
    }

    const category = await CategoryRepository.findCategoryById(id);
    return category;
  }

  static async addCategory(data: CategoryCreate) {
    const errorsValidation = addOrUpdateCategoryValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof CategoryCreate; message: string }[] = [];

    const existingName = await CategoryRepository.findCategoryByName(
      data.name.toLowerCase()
    );
    if (existingName) {
      dbErrors.push({ field: "name", message: "Category name already exist." });
    }

    const existingSlug = await CategoryRepository.findCategoryBySlug(
      data.slug.toLowerCase()
    );
    if (existingSlug) {
      dbErrors.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const newData = {
      name: data.name.toLowerCase(),
      slug: slugify(data.slug, { lower: true }),
      created_by: data.created_by,
    };
    const category = await CategoryRepository.createCategory(newData);
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

    const existingName = await CategoryRepository.findCategoryByName(
      data.name.toLowerCase()
    );
    if (existingName && existingName.id !== data.id) {
      dbErrors.push({ field: "name", message: "Category name already exist." });
    }

    const existingSlug = await CategoryRepository.findCategoryBySlug(
      data.slug.toLowerCase()
    );
    if (existingSlug && existingSlug.id !== data.id) {
      dbErrors.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const newData = {
      id: data.id,
      name: data.name.toLowerCase(),
      slug: slugify(data.slug, { lower: true }),
      updated_by: data.updated_by,
    };

    const update = await CategoryRepository.updateCategoryById(newData);
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

  static async deleteManyCategory(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data categories not found.", 404);
    }

    const deleteCategories = await CategoryRepository.deleteCategoryManyById(
      ids
    );
    return deleteCategories;
  }
}
