import slugify from "slugify";
import SubCategoryRepository from "../repositories/subcategory.repository";
import {
  GetSubCategoriesQueryBase,
  SubCategoriesAllowedSearchBy,
  SubCategoriesAllowedSortBy,
  SubCategoriesSortOrder,
  SubCategoryCreate,
  SubCategoryUpdate,
} from "../types/sub-category.type";
import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import { createOrUpdatesubCategoryValidation } from "../validations/sub-category.validation";

export default class SubCategoriesService {
  static async getSubCategories(query: GetSubCategoriesQueryBase) {
    const page = Math.max(parseInt(query.page ?? "1"), 1);
    const limit = Math.max(parseInt(query.limit ?? "10"), 1);
    const search = query.search?.toString();

    const allowedSearchBy: SubCategoriesAllowedSearchBy[] = [
      "name",
      "slug",
      "category",
    ];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as SubCategoriesAllowedSearchBy
    )
      ? (query.searchBy as SubCategoriesAllowedSearchBy)
      : undefined;

    const allowedSortBy: SubCategoriesAllowedSortBy[] = [
      "name",
      "slug",
      "category",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(
      query.sortBy as SubCategoriesAllowedSortBy
    )
      ? (query.sortBy as SubCategoriesAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: SubCategoriesSortOrder =
      rawOrder === "asc" ? "asc" : "desc";

    return await SubCategoryRepository.findSubCategories(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getSubCategoryById(id: string) {
    if (!id || id === null || id === "") {
      throw new AppError("Id required");
    }

    const subcategory = await SubCategoryRepository.findSubCategoryById(id);
    return subcategory;
  }

  static async createSubCategory(data: SubCategoryCreate) {
    const errorsValidation =
      createOrUpdatesubCategoryValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErros: { field: keyof SubCategoryCreate; message: string }[] = [];

    const existingName = await SubCategoryRepository.findSubCategoryByName(
      data.name.toLowerCase()
    );
    if (existingName) {
      dbErros.push({
        field: "name",
        message: "Sub category name already exist",
      });
    }

    const exisingSlug = await SubCategoryRepository.findSubCategoryBySlug(
      data.slug.toLowerCase()
    );
    if (exisingSlug) {
      dbErros.push({ field: "slug", message: "Slug already exist." });
    }

    if (dbErros.length > 0) {
      throw new AppError("Validation failed", 400, dbErros);
    }

    const newData: SubCategoryCreate = {
      name: data.name.toLowerCase(),
      slug: slugify(data.slug, { lower: true }),
      category_id: data.category_id,
      created_by: data.created_by,
    };
    const create = await SubCategoryRepository.createSubCategory(newData);
    return create;
  }

  static async updateSubCategory(data: SubCategoryUpdate) {
    const errorsValidation =
      createOrUpdatesubCategoryValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof SubCategoryUpdate; message: string }[] = [];

    const existingName = await SubCategoryRepository.findSubCategoryByName(
      data.name.toLowerCase()
    );
    if (existingName && existingName.id !== data.id) {
      dbErrors.push({
        field: "name",
        message: "Sub category name already exist",
      });
    }

    const existingSlug = await SubCategoryRepository.findSubCategoryBySlug(
      data.slug.toLowerCase()
    );
    if (existingSlug && existingSlug.id !== data.id) {
      dbErrors.push({ field: "slug", message: "Slug already exist" });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const newData: SubCategoryUpdate = {
      id: data.id,
      name: data.name.toLowerCase(),
      slug: slugify(data.slug, { lower: true }),
      category_id: data.category_id,
      updated_by: data.updated_by,
    };

    const update = await SubCategoryRepository.updateSubCategoryById(newData);
    return update;
  }

  static async deleteSubCategory(id: string) {
    if (!id || id === null || id === "") {
      throw new AppError("Id sub category not found", 404);
    }

    const subcategory = await SubCategoryRepository.findSubCategoryById(id);
    if (!subcategory) {
      throw new AppError("Sub category not found", 404);
    }

    const deleteSubCategory = await SubCategoryRepository.deleteSubCategoryById(
      id
    );
    return deleteSubCategory;
  }

  static async deleteManySubCategory(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data categories not found", 404);
    }

    const deleteSubcategories =
      await SubCategoryRepository.deleteManySubCatagoryById(ids);
    return deleteSubcategories;
  }
}
