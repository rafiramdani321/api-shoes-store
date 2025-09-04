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

export interface PermissionBaseType {
  name: string;
  description?: string;
  module?: string;
}

export interface PermissionCreateType extends PermissionBaseType {
  created_at: string;
}

export interface PermissionUpdateType extends PermissionBaseType {
  id: string;
  updated_at: string;
}

export interface GetPermissionQueryBase {
  page?: string;
  limit?: string;
  search?: string;
  searchBy?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type PermissionAllowedSearchBy = "name" | "module";
export type PermissionAllowedSortBy =
  | "name"
  | "module"
  | "created_at"
  | "updated_at";
export type PermissionSortOrder = "asc" | "desc";

export interface RolePermissionBaseType {
  role_id: string;
  permission_id: string;
}

export interface RolePermissionCreateType extends RolePermissionBaseType {
  created_at?: string;
}

export interface RolePermissionUpdateType extends RolePermissionBaseType {
  id: string;
  updated_at?: string;
}

export interface GetRolePermissionQueryBase {
  page?: string;
  limit?: string;
  search?: string;
  searchBy?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type RolePermissionAllowedSearchBy =
  | "role_name"
  | "permission_name"
  | "permission_module";

export type RolePermissionAllowedSortBy =
  | "role_name"
  | "permission_name"
  | "permission_module"
  | "created_at"
  | "updated_at";
export type RolePermissionSortOrder = "asc" | "desc";
