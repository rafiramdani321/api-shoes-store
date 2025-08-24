export interface CategoryBase {
  name: string;
  slug: string;
}

export interface CategoryCreate extends CategoryBase {
  created_by: string;
}

export interface CategoryUpdate extends CategoryBase {
  id: string;
  updated_by: string;
}

export interface GetCategoriesQueryBase {
  page?: string;
  limit?: string;
  searchBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type CategoriesAllowedSearchBy = "name" | "slug";
export type CategoriesAllowedSortBy =
  | "name"
  | "slug"
  | "created_at"
  | "updated_at";
export type CategoriesSortOrder = "asc" | "desc";
