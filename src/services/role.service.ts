import RoleRepository from "../repositories/role.repository";
import {
  GetPermissionQueryBase,
  GetRolePermissionQueryBase,
  GetRolesQueryBase,
  PermissionAllowedSearchBy,
  PermissionAllowedSortBy,
  PermissionSortOrder,
  RoleAllowedSortBy,
  RoleCreateType,
  RolePermissionAllowedSearchBy,
  RolePermissionAllowedSortBy,
  RolePermissionCreateType,
  RolePermissionSortOrder,
  RolePermissionUpdateType,
  RoleSortOrder,
  RoleUpdateType,
} from "../types/role.type";
import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import {
  createOrUpdateRolePermission,
  createOrUpdateRoleValidation,
} from "../validations/validation-schema";

export default class RoleService {
  static async getRoles(query: GetRolesQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;
    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;

    const search = query.search?.toString();
    const allowedSortBy: RoleAllowedSortBy[] = [
      "name",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(query.sortBy as RoleAllowedSortBy)
      ? (query.sortBy as RoleAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: RoleSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await RoleRepository.findRoles(
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getRoleById(id: string) {
    if (!id || id == "") {
      throw new AppError("Role id requried", 404);
    }

    const role = await RoleRepository.findRoleById(id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }
    return role;
  }

  static async getRoleByName(name: string) {
    if (!name || name === "") {
      throw new AppError("Role name is required");
    }

    const role = await RoleRepository.findRoleByName(name);
    return role;
  }

  static async addRole(data: RoleCreateType) {
    const errorsValidation = createOrUpdateRoleValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const dbErrors: { field: keyof RoleCreateType; message: string }[] = [];

    const existingName = await RoleRepository.findRoleByName(
      data.name.toLowerCase()
    );
    if (existingName) {
      dbErrors.push({ field: "name", message: "Role name already exist" });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const newData = {
      name: data.name.toLowerCase(),
      created_by: data.created_by,
    };
    const role = await RoleRepository.createRole(newData);
    return role;
  }

  static async updateRole(data: RoleUpdateType) {
    const errorValidation = createOrUpdateRoleValidation.safeParse(data);
    if (!errorValidation.success) {
      const errors = validationResponses(errorValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const role = await RoleRepository.findRoleById(data.id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const dbErrors: { field: keyof RoleUpdateType; message: string }[] = [];

    const existingName = await RoleRepository.findRoleByName(
      data.name.toLowerCase()
    );
    if (existingName && existingName.id !== data.id) {
      dbErrors.push({ field: "name", message: "Role name already exist" });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed", 400, dbErrors);
    }

    const newData = {
      id: data.id,
      name: data.name.toLowerCase(),
      updated_by: data.updated_by,
    };

    const update = await RoleRepository.updateRoleById(newData);
    return update;
  }

  static async deleteRole(id: string) {
    if (!id || id === "") {
      throw new AppError("Role id not found", 404);
    }

    const role = await RoleRepository.findRoleById(id);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const deleteRole = await RoleRepository.deleteRoleById(id);
    return deleteRole;
  }

  static async deleteManyRole(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data roles not found", 404);
    }

    const deleteRoles = await RoleRepository.deleteRoleManyByIds(ids);
    return deleteRoles;
  }

  static async getPermissions(query: GetPermissionQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;

    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;

    const search = query.search?.toString();

    const allowedSearchBy: PermissionAllowedSearchBy[] = ["name", "module"];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as PermissionAllowedSearchBy
    )
      ? (query.searchBy as PermissionAllowedSearchBy)
      : undefined;

    const allowedSortBy: PermissionAllowedSortBy[] = [
      "name",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(
      query.sortBy as PermissionAllowedSortBy
    )
      ? (query.sortBy as PermissionAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: PermissionSortOrder = rawOrder === "asc" ? "asc" : "desc";

    return await RoleRepository.findPermissions(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getRolePermissions(query: GetRolePermissionQueryBase) {
    const page =
      query.page && query.page.trim() !== ""
        ? Math.max(parseInt(query.page), 1)
        : 1;

    const limit =
      query.limit && query.limit.trim() !== ""
        ? Math.max(parseInt(query.limit), 1)
        : 10;

    const search = query.search?.toString();

    const allowedSearchBy: RolePermissionAllowedSearchBy[] = [
      "role_name",
      "permission_name",
      "permission_module",
    ];
    const searchBy = allowedSearchBy.includes(
      query.searchBy as RolePermissionAllowedSearchBy
    )
      ? (query.searchBy as RolePermissionAllowedSearchBy)
      : undefined;

    const allowedSortBy: RolePermissionAllowedSortBy[] = [
      "role_name",
      "permission_name",
      "permission_module",
      "created_at",
      "updated_at",
    ];
    const sortBy = allowedSortBy.includes(
      query.sortBy as RolePermissionAllowedSortBy
    )
      ? (query.sortBy as RolePermissionAllowedSortBy)
      : undefined;

    const rawOrder = query.sortOrder?.toLocaleLowerCase();
    const sortOrder: RolePermissionSortOrder =
      rawOrder === "asc" ? "asc" : "desc";

    return await RoleRepository.findRolePermissions(
      page,
      limit,
      searchBy,
      search,
      sortBy,
      sortOrder
    );
  }

  static async getRolePermissionById(id: string) {
    if (!id || id === "") {
      throw new AppError("Id not found", 404);
    }

    const rolePermission = await RoleRepository.findRolePermissionById(id);
    if (!rolePermission) {
      throw new AppError("Role permission not found", 404);
    }

    return rolePermission;
  }

  static async addRolePermission(data: RolePermissionCreateType) {
    const errorsValidation = createOrUpdateRolePermission.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const existing =
      await RoleRepository.findRolePermissionByRoleIdAndPermissionId(
        data.role_id,
        data.permission_id
      );
    if (existing) {
      throw new AppError("Role and permission already exists");
    }

    const newData: RolePermissionCreateType = {
      role_id: data.role_id,
      permission_id: data.permission_id,
    };
    const createRolePermission = await RoleRepository.addRolePermission(
      newData
    );
    return createRolePermission;
  }

  static async updateRolePermission(data: RolePermissionUpdateType) {
    const errorsValidation = createOrUpdateRolePermission.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed", 400, errors);
    }

    const existing =
      await RoleRepository.findRolePermissionByRoleIdAndPermissionId(
        data.role_id,
        data.permission_id
      );
    if (existing && existing.id !== data.id) {
      throw new AppError("Role and permission already exists");
    }

    const newData: RolePermissionUpdateType = {
      id: data.id,
      role_id: data.role_id,
      permission_id: data.permission_id,
    };

    return await RoleRepository.updateRolePermission(newData);
  }

  static async deleteRolePermissionById(id: string) {
    if (!id || id == "") {
      throw new AppError("Id not found", 404);
    }

    const rolePermission = await RoleRepository.findRolePermissionById(id);
    if (!rolePermission) {
      throw new AppError("Role permission not found", 404);
    }

    return await RoleRepository.deleteRolePermission(id);
  }

  static async deleteManyRolePermissions(ids: string[]) {
    if (ids.length < 0) {
      throw new AppError("Data role permissions ids not found", 404);
    }

    return await RoleRepository.deleteManyRolePermission(ids);
  }
}
