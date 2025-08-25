export interface SizeBaseType {
  size: string;
}

export interface SizeCreateType extends SizeBaseType {
  created_by: string;
}

export interface SizeUpdateType extends SizeBaseType {
  id: string;
  updated_by: string;
}

export interface GetSizeQueryBase {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type SizeAllowedSortBy = "size" | "created_at" | "updated_at";
export type SizeSortOrder = "asc" | "desc";
