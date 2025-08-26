import RoleRepository from "../repositories/role.repository";
import {
  GetRolesQueryBase,
  RoleAllowedSortBy,
  RoleCreateType,
  RoleSortOrder,
  RoleUpdateType,
} from "../types/role.type";
import { AppError } from "../utils/errors";
import { validationResponses } from "../validations/index.validation";
import { createOrUpdateRoleValidation } from "../validations/validation-schema";

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
}
