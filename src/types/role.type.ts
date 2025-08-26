export interface RoleBaseType {
  name: string;
}

export interface RoleCreateType extends RoleBaseType {
  created_by: string;
}

export interface RoleUpdateType extends RoleBaseType {
  id: string;
  updated_by: string;
}

export interface GetRolesQueryBase {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type RoleAllowedSortBy = "name" | "created_at" | "updated_at";
export type RoleSortOrder = "asc" | "desc";
