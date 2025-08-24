export interface SubCategoryBase {
  name: string;
  slug: string;
  category_id: string;
}

export interface SubCategoryCreate extends SubCategoryBase {
  created_by: string;
}

export interface SubCategoryUpdate extends SubCategoryBase {
  id: string;
  updated_by: string;
}

export interface GetSubCategoriesQueryBase {
  page?: string;
  limit?: string;
  searchBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type SubCategoriesAllowedSearchBy = "name" | "slug" | "category";
export type SubCategoriesAllowedSortBy =
  | "name"
  | "slug"
  | "category"
  | "created_at"
  | "updated_at";
export type SubCategoriesSortOrder = "asc" | "desc";
